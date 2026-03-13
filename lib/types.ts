export type EntityType = 'private-security' | 'law-enforcement' | 'activists';

export interface Interaction {
  id: string;
  quote: string;
  entity1: EntityType;
  entity2: EntityType;
  context: string;
  characterOffset: number;
}

export interface AnalysisResult {
  interactions: Interaction[];
  documentText: string;
  fileName: string;
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
