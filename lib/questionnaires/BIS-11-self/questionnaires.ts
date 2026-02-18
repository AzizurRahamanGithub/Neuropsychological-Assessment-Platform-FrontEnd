import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS = [
  { label: "Mai / Raramente", value: 1 },
  { label: "Talvolta", value: 2 },
  { label: "Spesso", value: 3 },
  { label: "Quasi sempre / Sempre", value: 4 },
] as const;

const QUESTIONS_1_30: string[] = [
  "Pianifico le attività attentamente",
  "Faccio le cose senza pensarci",
  "Decido velocemente",
  "Mi affido alla sorte",
  'Non "focalizzo l\'attenzione"',
  'I miei pensieri "vanno a gran velocità"',
  "Pianifico i viaggi con molto anticipo",
  "Ho autocontrollo",
  "Mi concentro facilmente",
  "Risparmio con regolarità",
  "Non riesco a star fermo durante gli spettacoli o le lezioni",
  "Sono un attento pensatore",
  "Faccio progetti per una sicurezza lavorativa",
  "Dico cose senza pensare",
  "Mi piace pensare a problemi complessi",
  "Cambio lavoro",
  'Agisco "d\'impulso"',
  "Mi annoio facilmente quando devo risolvere dei problemi concettuali",
  "Agisco sull'impulso del momento",
  "Sono un pensatore assiduo",
  "Cambio residenza",
  "Compro le cose d'impulso",
  "Riesco a pensare ad un solo problema per volta",
  "Cambio hobby",
  "Spendo più di quello che guadagno",
  "Quando penso ho spesso pensieri estranei",
  "Mi interesso più al presente che al futuro",
  "Sono irrequieto a teatro o durante le lezioni",
  "Mi piacciono i rompicapo",
  "Sono orientato verso il futuro",
];

// Reverse-scored items (positive items that need reversal: 1→4, 2→3, 3→2, 4→1)
const REVERSE_ITEMS: number[] = [1, 7, 8, 9, 10, 12, 13, 15, 20, 29, 30];

const questions: Question[] = QUESTIONS_1_30.map(
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

export const BIS11_SELF: QuestionnaireDef = {
  code: "BIS11_SELF",
  formCode: "BIS11_SELF",
  type: "SELF",
  name: "BIS11_SELF",
  instruction:
    "Nel seguente questionario vengono elencate una serie di situazioni nelle quali le persone usualmente vengono a trovarsi nel corso della propria vita. Selezioni cortesemente per ogni affermazione l'opzione che meglio La descrive. Il questionario va compilato nella sua totalità secondo quanto Lei pensa e senza l'aiuto di altre persone. Ovviamente, non esistono risposte giuste o sbagliate; è importante solo descrivere i propri sentimenti personali.",
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito = "sintomatico" | "limite" | "";

/**
 * UI sometimes sends:
 * - "Mai / Raramente__0"
 * - "1__0"
 * - { label: "Mai / Raramente" }
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
    // Reverse: 1→4, 2→3, 3→2, 4→1
    return 5 - rawScore;
  }

  return rawScore;
}

// ===============================
// COMPUTE
// ===============================

export function computeBIS11Self(answers: Record<string, any>) {
  // Get scores for all 30 questions
  const scores: number[] = [];
  for (let i = 1; i <= 30; i++) {
    scores.push(toScore(answers[qKey(i)], i));
  }

  // Attenzione: items 5, 9, 11, 20, 28 (questions 5, 9, 11, 20, 28)
  const attenzione_items = [5, 9, 11, 20, 28];
  const attenzione_punteggio = attenzione_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Impulsività cognitiva: items 6, 24, 26 (questions 6, 24, 26)
  const impulsivita_cognitiva_items = [6, 24, 26];
  const impulsivita_cognitiva_punteggio = impulsivita_cognitiva_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Impulsività motoria: items 2, 3, 4, 17, 19, 22, 25 (questions 2, 3, 4, 17, 19, 22, 25)
  const impulsivita_motoria_items = [2, 3, 4, 17, 19, 22, 25];
  const impulsivita_motoria_punteggio = impulsivita_motoria_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Perseveranza: items 16, 21, 23, 30 (questions 16, 21, 23, 30)
  const perseveranza_items = [16, 21, 23, 30];
  const perseveranza_punteggio = perseveranza_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Autocontrollo: items 1, 7, 8, 12, 13, 14 (questions 1, 7, 8, 12, 13, 14)
  const autocontrollo_items = [1, 7, 8, 12, 13, 14];
  const autocontrollo_punteggio = autocontrollo_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Complessità cognitiva: items 10, 15, 18, 27, 29 (questions 10, 15, 18, 27, 29)
  const complessita_cognitiva_items = [10, 15, 18, 27, 29];
  const complessita_cognitiva_punteggio = complessita_cognitiva_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Second-order factors
  // Fattore impulsività attentiva = attenzione + impulsività cognitiva
  const fattore_impulsivita_attentiva =
    attenzione_punteggio + impulsivita_cognitiva_punteggio;

  // Fattore impulsività motoria = impulsività motoria + perseveranza
  const fattore_impulsivita_motoria =
    impulsivita_motoria_punteggio + perseveranza_punteggio;

  // Fattore impulsività da non pianificazione = autocontrollo + complessità cognitiva
  const fattore_impulsivita_non_pianificazione =
    autocontrollo_punteggio + complessita_cognitiva_punteggio;

  // Scala totale = sum of the three second-order factors
  const scala_totale =
    fattore_impulsivita_attentiva +
    fattore_impulsivita_motoria +
    fattore_impulsivita_non_pianificazione;

  // Determine ESITO based on thresholds
  function getEsito(score: number, threshold: number): Esito {
    if (score > threshold) return "sintomatico";
    if (score === threshold) return "limite";
    return "";
  }

  return {
    // Main scale
    "Scala totale PG": String(scala_totale),
    "Scala totale ESITO": getEsito(scala_totale, 80),

    // Second-order factors
    "Fattore impulsività attentiva PG": String(fattore_impulsivita_attentiva),
    "Fattore impulsività attentiva ESITO": getEsito(
      fattore_impulsivita_attentiva,
      21,
    ),
    // First-order factors (subscales)
    "Attenzione PG": String(attenzione_punteggio),
    "Attenzione ESITO": getEsito(attenzione_punteggio, 13),

    "Impulsività cognitiva PG": String(impulsivita_cognitiva_punteggio),
    "Impulsività cognitiva ESITO": getEsito(impulsivita_cognitiva_punteggio, 8),

    "Fattore impulsività motoria PG": String(fattore_impulsivita_motoria),
    "Fattore impulsività motoria ESITO": getEsito(
      fattore_impulsivita_motoria,
      29,
    ),
    "Impulsività motoria PG": String(impulsivita_motoria_punteggio),
    "Impulsività motoria ESITO": getEsito(impulsivita_motoria_punteggio, 19),

    "Perseveranza PG": String(perseveranza_punteggio),
    "Perseveranza ESITO": getEsito(perseveranza_punteggio, 11),

    "Fattore impulsività da non pianificazione PG": String(
      fattore_impulsivita_non_pianificazione,
    ),
    "Fattore impulsività da non pianificazione ESITO": getEsito(
      fattore_impulsivita_non_pianificazione,
      29,
    ),

    "Autocontrollo PG": String(autocontrollo_punteggio),
    "Autocontrollo ESITO": getEsito(autocontrollo_punteggio, 16),

    "Complessità cognitiva PG": String(complessita_cognitiva_punteggio),
    "Complessità cognitiva ESITO": getEsito(
      complessita_cognitiva_punteggio,
      13,
    ),
  };
}
