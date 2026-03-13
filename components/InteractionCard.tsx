'use client';

import { Interaction, ENTITY_LABELS, ENTITY_COLORS } from '@/lib/types';
import CopyButton from './CopyButton';

interface Props {
  interaction: Interaction;
  isActive: boolean;
  onClick: () => void;
}

export default function InteractionCard({ interaction, isActive, onClick }: Props) {
  const { quote, entity1, entity2, context } = interaction;

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg border cursor-pointer transition-all duration-200
        ${isActive
          ? 'border-gold bg-gold/10 shadow-md'
          : 'border-hairline bg-warm-white hover:border-pebble hover:shadow-sm'
        }
      `}
    >
      {/* Entity badges */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="px-2 py-0.5 rounded text-[0.6rem] font-mono tracking-[0.15em] uppercase text-white"
          style={{ backgroundColor: ENTITY_COLORS[entity1] }}
        >
          {ENTITY_LABELS[entity1]}
        </span>
        <span className="text-pebble text-xs font-mono">&harr;</span>
        <span
          className="px-2 py-0.5 rounded text-[0.6rem] font-mono tracking-[0.15em] uppercase text-white"
          style={{ backgroundColor: ENTITY_COLORS[entity2] }}
        >
          {ENTITY_LABELS[entity2]}
        </span>
      </div>

      {/* Context summary */}
      <p className="text-[0.7rem] text-ink-soft font-mono tracking-wide uppercase mb-2">
        {context}
      </p>

      {/* Quote */}
      <blockquote className="text-sm leading-relaxed text-ink border-l-2 border-hairline pl-3 mb-3 font-body italic">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Copy button */}
      <div className="flex justify-end">
        <CopyButton text={quote} />
      </div>
    </div>
  );
}
