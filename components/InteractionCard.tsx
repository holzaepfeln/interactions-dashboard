'use client';

import { Interaction, ENTITY_LABELS, ENTITY_COLORS } from '@/lib/types';
import CopyButton from './CopyButton';

interface Props {
  interaction: Interaction;
  isActive: boolean;
  onClick: () => void;
  documentId: string;
}

export default function InteractionCard({ interaction, isActive, onClick, documentId }: Props) {
  const { quote, entity1, entity2, context, pageNumber } = interaction;

  // Build citation string
  const citation = pageNumber
    ? `${documentId}, p. ${pageNumber}`
    : documentId;

  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg border cursor-pointer transition-all duration-200 overflow-hidden
        ${isActive
          ? 'border-gold shadow-md ring-1 ring-gold/30'
          : 'border-hairline bg-warm-white hover:border-pebble hover:shadow-sm card-hover'
        }
      `}
    >
      {/* Card header - entity badges */}
      <div
        className={`px-4 py-3 flex items-center gap-2.5 border-b ${
          isActive ? 'bg-gold/10 border-gold/20' : 'bg-parchment border-hairline'
        }`}
      >
        <span
          className="px-2.5 py-1 rounded text-[0.75rem] font-mono font-medium tracking-[0.1em] uppercase text-white"
          style={{ backgroundColor: ENTITY_COLORS[entity1] }}
        >
          {ENTITY_LABELS[entity1]}
        </span>
        <span className="text-pebble text-sm font-mono font-medium">&harr;</span>
        <span
          className="px-2.5 py-1 rounded text-[0.75rem] font-mono font-medium tracking-[0.1em] uppercase text-white"
          style={{ backgroundColor: ENTITY_COLORS[entity2] }}
        >
          {ENTITY_LABELS[entity2]}
        </span>
      </div>

      {/* Card body */}
      <div className={`p-4 ${isActive ? 'bg-gold/5' : 'bg-warm-white'}`}>
        {/* Context summary */}
        <p className="text-[0.7rem] text-ink-soft font-mono tracking-wide uppercase mb-2">
          {context}
        </p>

        {/* Quote */}
        <blockquote className="text-sm leading-relaxed text-ink border-l-2 border-hairline pl-3 mb-3 font-body italic">
          &ldquo;{quote}&rdquo;
        </blockquote>

        {/* Citation - always visible */}
        <div className="flex items-center gap-2 mb-3 pl-3">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9E9285" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="text-xs font-mono text-ink-soft tracking-wide">
            {citation}
          </span>
        </div>

        {/* Copy button */}
        <div className="flex justify-end border-t border-hairline pt-2.5">
          <CopyButton text={`"${quote}" (${citation})`} />
        </div>
      </div>
    </div>
  );
}
