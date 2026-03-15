/**
 * src/lib/analysis/momentumEngine.ts
 * Computes innovation momentum for regions and technologies based on tracked indicators.
 */
import { getAllMomentumScores, setMomentumScore } from "@/lib/database/database";

export interface MomentumData {
  research: number;
  patents: number;
  citations: number;
  funding: number;
  startups: number;
}

export function calculateMomentum(data: MomentumData): number {
  const researchWeight = 0.35;
  const patentWeight = 0.25;
  const citationWeight = 0.20;
  const fundingWeight = 0.10;
  const startupWeight = 0.10;

  const score = (
    (data.research * researchWeight) +
    (data.patents * patentWeight) +
    (data.citations * citationWeight) +
    (data.funding * fundingWeight) +
    (data.startups * startupWeight)
  );

  return Math.min(100, Math.round(score * 10) / 10);
}

/**
 * Recalculates the momentum score for all tracking entries in the database.
 * Designed to be run on a scheduled cron job.
 */
export async function updateMomentumScores() {
  const allScores = getAllMomentumScores();
  
  for (const record of allScores) {
    const data: MomentumData = {
      research: record.research_count,
      patents: record.patent_count,
      citations: record.citation_count,
      funding: 0, // Future feature: Funding APIs
      startups: 0 // Future feature: Crunchbase/Pitchbook APIs
    };
    
    const newScore = calculateMomentum(data);
    
    if (newScore !== record.momentum_score) {
      setMomentumScore(record.id, newScore);
    }
  }
}
