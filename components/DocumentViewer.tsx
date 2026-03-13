'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Interaction, ENTITY_COLORS } from '@/lib/types';

interface Props {
  text: string;
  interactions: Interaction[];
  activeInteractionId: string | null;
}

interface TextSegment {
  text: string;
  interactionId: string | null;
  entity1Color: string | null;
  entity2Color: string | null;
}

export default function DocumentViewer({ text, interactions, activeInteractionId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLSpanElement>(null);

  // Scroll to highlighted interaction when active changes
  useEffect(() => {
    if (activeInteractionId && activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeInteractionId]);

  // Build segments: split text into highlighted and non-highlighted parts
  const segments = useMemo(() => {
    if (!interactions.length) {
      return [{ text, interactionId: null, entity1Color: null, entity2Color: null }] as TextSegment[];
    }

    // Find all quote positions
    const matches = interactions
      .map((interaction) => {
        const idx = text.indexOf(interaction.quote);
        if (idx === -1) {
          // Try fuzzy: first 60 chars
          const snippet = interaction.quote.substring(0, 60);
          const fuzzyIdx = text.indexOf(snippet);
          if (fuzzyIdx === -1) return null;
          return {
            start: fuzzyIdx,
            end: fuzzyIdx + interaction.quote.length,
            interaction,
          };
        }
        return {
          start: idx,
          end: idx + interaction.quote.length,
          interaction,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a!.start - b!.start) as { start: number; end: number; interaction: Interaction }[];

    // Merge overlapping ranges
    const merged: typeof matches = [];
    for (const m of matches) {
      if (merged.length && m.start < merged[merged.length - 1].end) {
        // Overlap - extend the previous range
        merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, m.end);
      } else {
        merged.push({ ...m });
      }
    }

    const result: TextSegment[] = [];
    let cursor = 0;

    for (const match of merged) {
      // Text before this match
      if (match.start > cursor) {
        result.push({
          text: text.slice(cursor, match.start),
          interactionId: null,
          entity1Color: null,
          entity2Color: null,
        });
      }

      // The highlighted segment
      result.push({
        text: text.slice(match.start, match.end),
        interactionId: match.interaction.id,
        entity1Color: ENTITY_COLORS[match.interaction.entity1],
        entity2Color: ENTITY_COLORS[match.interaction.entity2],
      });

      cursor = match.end;
    }

    // Remaining text
    if (cursor < text.length) {
      result.push({
        text: text.slice(cursor),
        interactionId: null,
        entity1Color: null,
        entity2Color: null,
      });
    }

    return result;
  }, [text, interactions]);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto" style={{ padding: '28px 32px 28px 40px' }}>
      <div className="w-full">
        <div className="whitespace-pre-wrap text-sm leading-[1.8] font-body text-ink break-words" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
          {segments.map((segment, i) => {
            if (!segment.interactionId) {
              return <span key={i}>{segment.text}</span>;
            }

            const isActive = segment.interactionId === activeInteractionId;

            return (
              <span
                key={i}
                id={`doc-${segment.interactionId}`}
                ref={isActive ? activeRef : undefined}
                className={`
                  relative cursor-pointer rounded-sm px-0.5 transition-all duration-300
                  ${isActive ? 'highlight-active ring-2 ring-gold/40' : ''}
                `}
                style={{
                  backgroundColor: isActive
                    ? undefined
                    : `${segment.entity1Color}15`,
                  borderBottom: `2px solid ${segment.entity1Color}`,
                }}
              >
                {segment.text}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
