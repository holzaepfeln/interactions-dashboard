'use client';

import { useState } from 'react';
import { Interaction, EntityType, ENTITY_LABELS, ENTITY_COLORS } from '@/lib/types';
import InteractionCard from './InteractionCard';

interface Props {
  interactions: Interaction[];
  activeInteractionId: string | null;
  onInteractionClick: (id: string) => void;
  documentId: string;
}

type FilterPair = 'all' | `${EntityType}-${EntityType}`;

const PAIR_OPTIONS: { value: FilterPair; label: string }[] = [
  { value: 'all', label: 'All Interactions' },
  { value: 'private-security-law-enforcement', label: 'Security \u2194 Law Enforcement' },
  { value: 'private-security-activists', label: 'Security \u2194 Activists' },
  { value: 'law-enforcement-activists', label: 'Law Enforcement \u2194 Activists' },
];

function matchesPair(interaction: Interaction, filter: FilterPair): boolean {
  if (filter === 'all') return true;
  const [f1, f2] = filter.split('-').reduce<string[]>((acc, part, i, arr) => {
    // Reconstruct entity keys from the filter string
    if (acc.length === 0) {
      // Build first entity
      if (part === 'private' && arr[i + 1] === 'security') return acc;
      if (part === 'security') return [...acc, 'private-security'];
      if (part === 'law' && arr[i + 1] === 'enforcement') return acc;
      if (part === 'enforcement') return [...acc, 'law-enforcement'];
      if (part === 'activists') return [...acc, 'activists'];
    } else if (acc.length === 1) {
      if (part === 'private' && arr[i + 1] === 'security') return acc;
      if (part === 'security') return [...acc, 'private-security'];
      if (part === 'law' && arr[i + 1] === 'enforcement') return acc;
      if (part === 'enforcement') return [...acc, 'law-enforcement'];
      if (part === 'activists') return [...acc, 'activists'];
    }
    return acc;
  }, []);

  return (
    (interaction.entity1 === f1 && interaction.entity2 === f2) ||
    (interaction.entity1 === f2 && interaction.entity2 === f1)
  );
}

export default function InteractionPanel({ interactions, activeInteractionId, onInteractionClick, documentId }: Props) {
  const [filter, setFilter] = useState<FilterPair>('all');

  const filtered = interactions.filter((i) => matchesPair(i, filter));

  // Count by pair type
  const counts: Record<string, number> = {};
  for (const interaction of interactions) {
    const key = [interaction.entity1, interaction.entity2].sort().join('-');
    counts[key] = (counts[key] || 0) + 1;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div style={{ padding: '18px 20px 16px', borderBottom: '1px solid #D9D2C7', backgroundColor: '#F5F0E8', flexShrink: 0 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
          <h2 className="font-serif text-lg font-light text-ink">
            Extracted Interactions
          </h2>
          <span className="font-mono text-[0.65rem] tracking-wider text-pebble uppercase">
            {filtered.length} of {interactions.length}
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5">
          {PAIR_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`
                px-2.5 py-1 rounded text-[0.6rem] font-mono tracking-wider uppercase transition-all
                ${filter === opt.value
                  ? 'bg-midnight text-parchment'
                  : 'bg-parchment text-ink-soft border border-hairline hover:border-pebble'
                }
              `}
            >
              {opt.label}
              {opt.value !== 'all' && counts[opt.value] != null && (
                <span className="ml-1 opacity-60">({counts[opt.value] || 0})</span>
              )}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #D9D2C7' }}>
          {(Object.keys(ENTITY_LABELS) as EntityType[]).map((key) => (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: ENTITY_COLORS[key] }}
              />
              <span className="text-[0.6rem] font-mono tracking-wider uppercase text-ink-soft">
                {ENTITY_LABELS[key]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Interaction list - generous padding and spacing */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-pebble">
            <p className="font-serif text-lg">No interactions found</p>
            <p className="text-sm mt-1">Try a different filter</p>
          </div>
        ) : (
          filtered.map((interaction) => (
            <InteractionCard
              key={interaction.id}
              interaction={interaction}
              isActive={interaction.id === activeInteractionId}
              onClick={() => onInteractionClick(interaction.id)}
              documentId={documentId}
            />
          ))
        )}
      </div>
    </div>
  );
}
