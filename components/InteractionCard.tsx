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

  // Build citation string - always show documentId, add page if available
  const citation = pageNumber != null
    ? `${documentId}, p. ${pageNumber}`
    : `${documentId}`;

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: '10px',
        border: isActive ? '2px solid #B8924A' : '1px solid #D9D2C7',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: isActive ? '0 4px 16px rgba(184,146,74,0.2)' : '0 1px 4px rgba(43,35,24,0.06)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Card header - entity badges */}
      <div
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: isActive ? '1px solid rgba(184,146,74,0.3)' : '1px solid #D9D2C7',
          backgroundColor: isActive ? 'rgba(184,146,74,0.1)' : '#F5F0E8',
        }}
      >
        <span
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: 'white',
            backgroundColor: ENTITY_COLORS[entity1],
          }}
        >
          {ENTITY_LABELS[entity1]}
        </span>
        <span style={{ color: '#9E9285', fontSize: '14px', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500 }}>
          &harr;
        </span>
        <span
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: 'white',
            backgroundColor: ENTITY_COLORS[entity2],
          }}
        >
          {ENTITY_LABELS[entity2]}
        </span>
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 18px', backgroundColor: isActive ? 'rgba(184,146,74,0.03)' : '#FAF7F2' }}>
        {/* Context summary */}
        <p style={{
          fontSize: '0.7rem',
          color: '#5A4E3F',
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: '0.05em',
          textTransform: 'uppercase' as const,
          marginBottom: '10px',
        }}>
          {context}
        </p>

        {/* Quote */}
        <blockquote style={{
          fontSize: '0.875rem',
          lineHeight: 1.7,
          color: '#2B2318',
          borderLeft: '2px solid #D9D2C7',
          paddingLeft: '12px',
          marginBottom: '12px',
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontStyle: 'italic',
        }}>
          &ldquo;{quote}&rdquo;
        </blockquote>

        {/* Citation - ALWAYS visible */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px',
          paddingLeft: '12px',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9E9285" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span style={{
            fontSize: '0.8rem',
            fontFamily: "'IBM Plex Mono', monospace",
            color: '#5A4E3F',
            letterSpacing: '0.03em',
            fontWeight: 500,
          }}>
            {citation}
          </span>
        </div>

        {/* Copy button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #D9D2C7', paddingTop: '10px' }}>
          <CopyButton text={`"${quote}" (${citation})`} />
        </div>
      </div>
    </div>
  );
}
