import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: `Analyze the following document and extract ALL interactions between these three entity categories:

1. **Private Security** — private security firms, corporate security, private investigators, security contractors, hired security personnel, private police, etc.
2. **Public Law Enforcement** — police departments, sheriffs, FBI, state troopers, federal agents, prosecutors, DAs, government law enforcement agencies, etc.
3. **Activists** — protesters, activists, advocacy groups, environmental activists, civil rights organizations, community organizers, dissidents, demonstrators, etc.

An "interaction" is any passage where two of these entity categories are mentioned together — coordination, confrontation, communication, surveillance, collaboration, conflict, legal proceedings, etc.

For each interaction found, extract:
- The EXACT quote from the document (word-for-word, include enough context to understand the interaction — typically 1-3 sentences)
- Which two entity categories are involved
- A brief description of the nature of the interaction (1 sentence)

Return your response as a JSON array. Each element should have:
- "quote": the exact text from the document
- "entity1": one of "private-security", "law-enforcement", or "activists"
- "entity2": one of "private-security", "law-enforcement", or "activists" (different from entity1)
- "context": brief description of the interaction

Important rules:
- Extract EVERY interaction you can find, even subtle ones
- Quotes must be EXACT text from the document — do not paraphrase
- Order the results by where they appear in the document (earliest first)
- entity1 and entity2 must be different categories
- Return ONLY the JSON array, no other text

Document:
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
