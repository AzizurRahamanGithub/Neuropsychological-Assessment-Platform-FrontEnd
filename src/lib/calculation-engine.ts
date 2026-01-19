import type { ADHDMetrics } from '@/types';

/**
 * Calculation Engine for ADHD diagnostic metrics
 * Implements the Barkley Adult ADHD Rating Scale-IV scoring logic
 */

interface QuestionScore {
  [questionId: number]: number;
}

interface RawScores {
  disattenzione: number[];
  iperattivita: number[];
  impulsivita: number[];
  sct: number[];
}

/**
 * Calculate ADHD metrics from questionnaire responses
 */
export function calculateADHDMetrics(
  responses: QuestionScore,
  questionMapping: {
    disattenzione: number[];
    iperattivita: number[];
    impulsivita: number[];
    sct: number[];
    etaInizio: number;
    ambitiCompromissione: number[];
  },
): ADHDMetrics {
  // Extract scores for each dimension
  const disattenzioneScores = questionMapping.disattenzione.map((qId) => responses[qId] || 0);
  const iperattivitaScores = questionMapping.iperattivita.map((qId) => responses[qId] || 0);
  const impulsivitaScores = questionMapping.impulsivita.map((qId) => responses[qId] || 0);
  const sctScores = questionMapping.sct.map((qId) => responses[qId] || 0);

  // Calculate total scores for each dimension
  const disattenzioniPunteggio = disattenzioneScores.reduce((a, b) => a + b, 0);
  const iperattivitaPunteggio = iperattivitaScores.reduce((a, b) => a + b, 0);
  const impulsivitaPunteggio = impulsivitaScores.reduce((a, b) => a + b, 0);
  const sctPunteggio = sctScores.reduce((a, b) => a + b, 0);

  // Count number of symptoms (typically score >= 2 indicates presence)
  const disattenzioniSintomi = countSymptoms(disattenzioneScores);
  const iperattivitaSintomi = countSymptoms(iperattivitaScores);
  const impulsivitaSintomi = countSymptoms(impulsivitaScores);
  const sctSintomi = countSymptoms(sctScores);
  const iperattivitaImpulsivitaSintomi = iperattivitaSintomi + impulsivitaSintomi;

  // Total ADHD metrics
  const totaleAdhPunteggio = disattenzioniPunteggio + iperattivitaPunteggio + impulsivitaPunteggio;
  const totaleAdhSintomi = disattenzioniSintomi + iperattivitaSintomi + impulsivitaSintomi;
  const iperattivitaImpulsivitaPunteggio = iperattivitaPunteggio + impulsivitaPunteggio;

  return {
    disattenzioniSintomi,
    disattenzioniPunteggio,
    iperattivitaPunteggio,
    iperattivitaSintomi,
    impulsivitaPunteggio,
    impulsivitaSintomi,
    iperattivitaImpulsivitaSintomi,
    sctPunteggio,
    sctSintomi,
    etaInizioSintomi: extractEtaInizio(responses[questionMapping.etaInizio]),
    ambitiCompromissione: extractAmbitiCompromissione(
      questionMapping.ambitiCompromissione,
      responses,
    ),
    totaleAdhPunteggio,
    totaleAdhSintomi,
    iperattivitaImpulsivitaPunteggio,
    iperattivitaImpulsivitaSintomi,
  };
}

/**
 * Count symptoms (responses >= 2 indicate symptom presence)
 */
function countSymptoms(scores: number[]): number {
  return scores.filter((score) => score >= 2).length;
}

/**
 * Extract age of symptom onset from response
 */
function extractEtaInizio(response: any): string {
  if (!response) return 'Unknown';
  
  const responseStr = response.toString().toLowerCase();
  
  if (responseStr.includes('12')) return 'Prima dei 12 anni';
  if (responseStr.includes('17')) return '12-17 anni';
  if (responseStr.includes('18')) return '18+ anni';
  
  return response.toString();
}

/**
 * Extract impairment domains from responses
 */
function extractAmbitiCompromissione(
  questionIds: number[],
  responses: QuestionScore,
): string[] {
  const domains = [
    'Lavoro/Scuola',
    'Relazioni',
    'Attività ricreative',
    'Autostima',
    'Guida',
  ];

  return questionIds
    .map((qId, index) => (responses[qId] ? domains[index] : null))
    .filter((domain) => domain !== null) as string[];
}

/**
 * Determine cut-off status and statistical significance
 */
export interface CutOffResult {
  status: 'normal' | 'borderline' | 'clinical' | 'severe';
  percentile: number;
  tScore: number;
  statistically_significant: boolean;
}

export function determineCutOffStatus(
  rawScore: number,
  dimension: 'disattenzione' | 'iperattivita' | 'impulsivita' | 'total',
  ageGroup?: string,
): CutOffResult {
  // Normative data for different age groups (simplified)
  const cutoffs: Record<string, Record<string, { mean: number; sd: number }>> = {
    'all': {
      'disattenzione': { mean: 12, sd: 6.5 },
      'iperattivita': { mean: 10, sd: 6.0 },
      'impulsivita': { mean: 8, sd: 5.5 },
      'total': { mean: 30, sd: 16.0 },
    },
  };

  const group = ageGroup || 'all';
  const normData = cutoffs[group] || cutoffs['all'];
  const stats = normData[dimension] || { mean: 20, sd: 10 };

  // Calculate T-score (mean = 50, SD = 10)
  const zScore = (rawScore - stats.mean) / stats.sd;
  const tScore = 50 + zScore * 10;

  // Calculate percentile from T-score
  const percentile = percentileFromTScore(tScore);

  // Determine status based on percentile
  let status: 'normal' | 'borderline' | 'clinical' | 'severe';
  if (percentile >= 98) {
    status = 'severe';
  } else if (percentile >= 90) {
    status = 'clinical';
  } else if (percentile >= 75) {
    status = 'borderline';
  } else {
    status = 'normal';
  }

  return {
    status,
    percentile: Math.round(percentile),
    tScore: Math.round(tScore),
    statistically_significant: percentile >= 90,
  };
}

/**
 * Convert T-score to percentile using normal distribution
 */
function percentileFromTScore(tScore: number): number {
  // Approximation of normal cumulative distribution function
  const z = (tScore - 50) / 10;
  
  // Using approximation formula (error < 0.00012)
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;

  const absZ = Math.abs(z);
  const t = 1.0 / (1.0 + p * absZ);
  const t2 = t * t;
  const t3 = t2 * t;
  const t4 = t3 * t;
  const t5 = t4 * t;

  let phi = 1.0 - c * Math.exp(-z * z / 2.0) * (
    b1 * t + b2 * t2 + b3 * t3 + b4 * t4 + b5 * t5
  );

  if (z < 0) {
    phi = 1.0 - phi;
  }

  return phi * 100;
}

/**
 * Generate comprehensive ADHD diagnostic report
 */
export function generateDiagnosticReport(
  metrics: ADHDMetrics,
  ageGroup?: string,
): {
  diagnosis: 'ADHD' | 'Borderline' | 'Non-ADHD';
  confidence: number;
  recommendations: string[];
} {
  const disattenzioneStatus = determineCutOffStatus(
    metrics.disattenzioniPunteggio,
    'disattenzione',
    ageGroup,
  );
  const iperattivitaStatus = determineCutOffStatus(
    metrics.iperattivitaPunteggio,
    'iperattivita',
    ageGroup,
  );
  const impulsivitaStatus = determineCutOffStatus(
    metrics.impulsivitaPunteggio,
    'impulsivita',
    ageGroup,
  );

  // DSM-5 ADHD criteria
  const meetsInattentionCriteria = metrics.disattenzioniSintomi >= 5;
  const meetsHyperactivityCriteria = metrics.iperattivitaImpulsivitaSintomi >= 5;
  const meetsSymptomOnsetCriteria = metrics.etaInizioSintomi !== '18+ anni';
  const meetsImpairmentCriteria = metrics.ambitiCompromissione.length >= 2;

  let diagnosis: 'ADHD' | 'Borderline' | 'Non-ADHD';
  let confidence = 0;
  const recommendations: string[] = [];

  if (
    (meetsInattentionCriteria || meetsHyperactivityCriteria) &&
    meetsSymptomOnsetCriteria &&
    meetsImpairmentCriteria
  ) {
    diagnosis = 'ADHD';
    confidence = 85;
    recommendations.push(
      'Consider formal ADHD assessment with clinical interview',
      'Rule out other medical conditions',
      'Assess for comorbid conditions (anxiety, depression)',
      'Consider treatment options (behavioral, pharmacological)',
    );
  } else if (
    (meetsInattentionCriteria || meetsHyperactivityCriteria) ||
    meetsImpairmentCriteria
  ) {
    diagnosis = 'Borderline';
    confidence = 60;
    recommendations.push(
      'Further assessment recommended',
      'Conduct detailed clinical interview',
      'Collect collateral information from family/school',
      'Monitor symptoms over time',
    );
  } else {
    diagnosis = 'Non-ADHD';
    confidence = 70;
    recommendations.push(
      'Current assessment does not support ADHD diagnosis',
      'Explore other potential causes of reported symptoms',
      'Consider other psychological factors',
    );
  }

  return {
    diagnosis,
    confidence,
    recommendations,
  };
}
