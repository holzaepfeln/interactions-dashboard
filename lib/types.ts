export type EntityType = 'private-security' | 'law-enforcement' | 'activists';

export interface Interaction {
  id: string;
  quote: string;
  entity1: EntityType;
  entity2: EntityType;
  context: string;
  characterOffset: number;
  pageNumber: number | null;
}

export interface AnalysisResult {
  interactions: Interaction[];
  documentText: string;
  fileName: string;
  documentId: string;
  pageBreaks: number[];
}

export const ENTITY_LABELS: Record<EntityType, string> = {
  'private-security': 'Private Security',
  'law-enforcement': 'Public Law Enforcement',
  'activists': 'Activists',
};

export const ENTITY_COLORS: Record<EntityType, string> = {
  'private-security': '#C4654A',
  'law-enforcement': '#2E5F8A',
  'activists': '#5E7A63',
};

/**
 * Given a character offset and page break positions, return the page number (1-indexed)
 */
export function getPageNumber(charOffset: number, pageBreaks: number[]): number | null {
  if (charOffset < 0 || !pageBreaks.length) return null;
  for (let i = pageBreaks.length - 1; i >= 0; i--) {
    if (charOffset >= pageBreaks[i]) {
      return i + 1;
    }
  }
  return 1;
}
