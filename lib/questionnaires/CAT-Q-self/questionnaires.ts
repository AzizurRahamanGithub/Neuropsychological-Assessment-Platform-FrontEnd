import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS = [
  { label: "Fortemente in disaccordo", value: 1 },
  { label: "In disaccordo", value: 2 },
  { label: "Parzialmente in disaccordo", value: 3 },
  { label: "Né d'accordo né in disaccordo", value: 4 },
  { label: "Parzialmente d'accordo", value: 5 },
  { label: "D'accordo", value: 6 },
  { label: "Fortemente d'accordo", value: 7 },
] as const;

const QUESTIONS_1_25: string[] = [
  "Quando interagisco con qualcuno, copio deliberatamente il suo linguaggio corporeo o le sue espressioni facciali.",
  "Controllo il mio linguaggio corporeo o le mie espressioni facciali per apparire rilassato/a.",
  'Raramente sento il bisogno di "recitare una parte" per affrontare una situazione sociale.',
  'Ho sviluppato uno "script" da seguire nelle situazioni sociali.',
  "Ripeto frasi che ho sentito dire da altri esattamente nello stesso modo in cui le ho sentite per la prima volta.",
  "Modifico il mio linguaggio corporeo o le mie espressioni facciali per apparire interessato/a alla persona con cui sto interagendo.",
  'Nelle situazioni sociali, ho la sensazione di "stare recitando" più che essere me stesso/a.',
  "Nelle mie interazioni sociali utilizzo comportamenti che ho imparato osservando altre persone mentre interagiscono.",
  "Penso sempre all'impressione che faccio sugli altri.",
  "Ho bisogno del supporto di altre persone per riuscire a socializzare.",
  "Mi esercito nelle mie espressioni facciali e nel mio linguaggio corporeo per assicurarmi che appaiano naturali.",
  "Non sento il bisogno di stabilire il contatto visivo con gli altri se non ne ho voglia.",
  "Devo costringermi a interagire con le persone quando mi trovo in situazioni sociali.",
  "Ho cercato di migliorare la mia comprensione delle abilità sociali osservando altre persone.",
  "Controllo il mio linguaggio corporeo o le mie espressioni facciali per apparire interessato/a alla persona con cui sto parlando.",
  "Nelle situazioni sociali cerco di trovare modi per evitare di interagire con gli altri.",
  "Ho studiato le regole delle interazioni sociali per migliorare le mie abilità sociali.",
  "Sono sempre consapevole dell'impressione che faccio sugli altri.",
  "Mi sento libero/a di essere me stesso/a quando sono con altre persone.",
  "Imparo come le persone usano corpo e volto nelle interazioni osservando programmi televisivi, film o leggendo narrativa.",
  "Modifico il mio linguaggio corporeo o le mie espressioni facciali per apparire rilassato/a.",
  "Quando parlo con gli altri ho la sensazione che la conversazione scorra in modo naturale.",
  "Ho imparato abilità sociali guardando programmi televisivi e film, e cerco di usarle nelle mie interazioni.",
  "Nelle interazioni sociali non presto attenzione a ciò che fa il mio volto o il mio corpo.",
  'Nelle situazioni sociali ho la sensazione di fingere di essere "normale".',
];

// Reverse-scored items (items where higher agreement means LESS camouflaging)
const REVERSE_ITEMS: number[] = [3, 12, 19, 22, 24];

const questions: Question[] = QUESTIONS_1_25.map(
  (text, i) =>
    ({
      key: `q${i + 1}`,
      number: i + 1,
      text,
      type: "single_choice",
      required: true,
      options: [...OPTIONS],
    }) satisfies Question,
);

export const CATQ_SELF: QuestionnaireDef = {
  code: "CATQ_SELF",
  formCode: "CATQ_SELF",
  type: "SELF",
  name: "CATQ_SELF",
  instruction:
    "Legga ciascuna delle affermazioni riportate di seguito e scelga la risposta che meglio descrive la Sua esperienza durante le interazioni sociali.",
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito = "sintomatico" | "";

/**
 * UI sometimes sends:
 * - "Fortemente in disaccordo__0"
 * - "1__0"
 * - { label: "Fortemente in disaccordo" }
 * - { value: 1 } / { id: 0 }
 * - 1
 */
function stripUiSuffix(v: unknown) {
  if (typeof v !== "string") return v;
  return v.split("__")[0].trim();
}

function toScore(ans: any, questionNumber: number): number {
  if (ans == null) return 0;

  // Determine if this question needs reverse scoring
  const needsReverse = REVERSE_ITEMS.includes(questionNumber);

  let rawScore = 0;

  if (typeof ans === "number") {
    rawScore = Number.isFinite(ans) ? ans : 0;
  } else if (typeof ans === "string") {
    const s0 = String(stripUiSuffix(ans));
    const n = Number(s0);
    if (!Number.isNaN(n) && Number.isFinite(n)) {
      rawScore = n;
    } else {
      rawScore = scoreFromLabel(s0);
    }
  } else if (typeof ans === "object") {
    const val = (ans as any).value ?? (ans as any).id ?? null;
    if (val != null) {
      const v0 = stripUiSuffix(val);
      const n = Number(v0);
      if (!Number.isNaN(n) && Number.isFinite(n)) {
        rawScore = n;
      }
    }
    const lab = (ans as any).label ?? null;
    if (lab != null && rawScore === 0) {
      rawScore = scoreFromLabel(String(stripUiSuffix(lab)));
    }
  }

  // Apply reverse scoring if needed
  if (needsReverse) {
    // Reverse: 1→7, 2→6, 3→5, 4→4, 5→3, 6→2, 7→1
    return 8 - rawScore;
  }

  return rawScore;
}

// ===============================
// COMPUTE
// ===============================

export function computeCATQSelf(answers: Record<string, any>) {
  // Get scores for all 25 questions
  const scores: number[] = [];
  for (let i = 1; i <= 25; i++) {
    scores.push(toScore(answers[qKey(i)], i));
  }

  // Compensazione: items 1,4,5,8,11,14,17,20,23
  const compensazione_items = [1, 4, 5, 8, 11, 14, 17, 20, 23];
  const compensazione_punteggio = compensazione_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Masking: items 2,6,9,12,15,18,21,24
  const masking_items = [2, 6, 9, 12, 15, 18, 21, 24];
  const masking_punteggio = masking_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Assimilazione: items 3,7,10,13,16,19,22,25
  const assimilazione_items = [3, 7, 10, 13, 16, 19, 22, 25];
  const assimilazione_punteggio = assimilazione_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Scala totale: sum of all items
  const scala_totale = scores.reduce((a, b) => a + b, 0);

  // Determine ESITO based on thresholds
  function getEsito(score: number, threshold: number): Esito {
    if (score >= threshold) return "sintomatico";
    return "";
  }

  return {
    // Main scale
    "Scala totale PG": String(scala_totale),
    "Scala totale ESITO": getEsito(scala_totale, 100),

    // Subscales
    "Compensazione PG": String(compensazione_punteggio),
    "Compensazione ESITO": getEsito(compensazione_punteggio, 38),

    "Masking PG": String(masking_punteggio),
    "Masking ESITO": getEsito(masking_punteggio, 34),

    "Assimilazione PG": String(assimilazione_punteggio),
    "Assimilazione ESITO": getEsito(assimilazione_punteggio, 34),
  };
}
