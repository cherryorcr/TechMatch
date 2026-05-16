import generatedResearchHighlights from './researchHighlights.generated.json';

export interface ResearchHighlight {
  application: string;
  detail: string;
  domain: string;
  id: string;
  maturity: string;
  organization: string;
  source: string;
  summary: string;
  tags: string[];
  title: string;
  type: '企业能力' | '科技成果' | '可转化成果' | '专利';
}

export const researchHighlights = generatedResearchHighlights as ResearchHighlight[];

function shuffleHighlights(highlights: ResearchHighlight[]) {
  const pool = [...highlights];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool;
}

export function getFeaturedResearchHighlights(limit = 8) {
  return shuffleHighlights(researchHighlights).slice(0, limit);
}
