import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 120; // Allow up to 2 minutes for long documents
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Read from .env.local first, falling back to .env — system env may have empty ANTHROPIC_API_KEY
  const envPath = require('path').resolve(process.cwd(), '.env');
  const envContent = require('fs').readFileSync(envPath, 'utf-8');
  const match = envContent.match(/^ANTHROPIC_API_KEY=(.+)$/m);
  const apiKey = match ? match[1].trim() : process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured. Add it to .env file.' }, { status: 500 });
  }
  const client = new Anthropic({ apiKey });
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16384,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: `You are a research assistant performing systematic text extraction. Your task is to exhaustively extract EVERY interaction between three entity categories from a document.

## Entity Categories

1. **Private Security** — private security firms, corporate security, private investigators, security contractors, hired security personnel, private police, security guards, security companies (e.g., TigerSwan, Pinkerton), corporate intelligence, private surveillance operators
2. **Public Law Enforcement** — police departments, sheriffs, sheriff's deputies, FBI, state troopers, federal agents, prosecutors, district attorneys, government law enforcement agencies, highway patrol, marshals, park rangers acting in law enforcement capacity
3. **Activists** — protesters, activists, advocacy groups, environmental activists, civil rights organizations, community organizers, dissidents, demonstrators, pipeline opponents, water protectors, indigenous rights advocates, social movement participants, NGOs acting in advocacy role

## What Counts as an "Interaction"

An interaction is ANY passage where two of these entity categories are mentioned together in a way that describes, implies, or references a relationship, encounter, or connection between them. This includes but is not limited to:
- Direct confrontation or conflict
- Coordination, collaboration, or cooperation
- Surveillance or monitoring
- Arrests, detentions, or legal proceedings
- Communication or information sharing
- Financial relationships or contracts
- One entity describing, referencing, or commenting on another
- Historical references to past interactions
- Allegations or claims about interactions
- Policy or procedural connections

## Systematic Extraction Process

Scan the document paragraph by paragraph from beginning to end. For EACH paragraph, ask: "Does this paragraph mention or reference at least two of the three entity categories?" If yes, extract the relevant passage. Do NOT skip any section of the document.

Include borderline cases — it is better to over-extract than to miss an interaction. Even a single sentence where two entity types appear together counts.

## Output Format

Return a JSON array. Each element must have:
- "quote": the EXACT text copied verbatim from the document (typically 1-3 sentences, enough to understand the full interaction in context)
- "entity1": one of "private-security", "law-enforcement", or "activists"
- "entity2": one of "private-security", "law-enforcement", or "activists" (must differ from entity1)
- "context": one-sentence description of the nature of the interaction

## Strict Rules

1. Quotes must be EXACT, word-for-word copies from the document — zero paraphrasing
2. Order results by where they appear in the document (earliest first)
3. entity1 and entity2 must be DIFFERENT categories
4. Extract from EVERY section — introduction, body, and conclusion
5. Include BOTH explicit interactions (direct encounters) and implicit ones (references, allegations, policy connections)
6. If a paragraph contains multiple distinct interactions, extract each as a separate entry
7. Return ONLY the JSON array — no commentary, no markdown formatting, no explanation

## Document

---
${text}
---`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response' }, { status: 500 });
    }

    let parsed;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      let jsonStr = content.text.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response', raw: content.text }, { status: 500 });
    }

    // Add IDs and character offsets
    const interactions = parsed.map((item: { quote: string; entity1: string; entity2: string; context: string }, index: number) => ({
      id: `interaction-${index}`,
      quote: item.quote,
      entity1: item.entity1,
      entity2: item.entity2,
      context: item.context,
      characterOffset: text.indexOf(item.quote),
    }));

    return NextResponse.json({ interactions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
