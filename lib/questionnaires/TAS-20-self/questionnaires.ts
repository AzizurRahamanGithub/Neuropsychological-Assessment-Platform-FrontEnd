import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS = [
  { label: "Per niente d'accordo", value: 1 },
  { label: "Non molto d'accordo", value: 2 },
  { label: "Né d'accordo né in disaccordo", value: 3 },
  { label: "D'accordo solamente in parte", value: 4 },
  { label: "Completamente d'accordo", value: 5 },
] as const;

const QUESTIONS_1_20: string[] = [
  "Sono spesso confuso circa le emozioni che provo.",
  "Mi è difficile trovare le giuste parole per esprimere i miei sentimenti.",
  "Provo delle sensazioni fisiche che neanche i medici capiscono.",
  "Riesco facilmente a descrivere i miei sentimenti.",
  "Preferisco approfondire i problemi piuttosto che descriverli semplicemente.",
  "Quando sono sconvolto non so se sono triste, spaventato o arrabbiato.",
  "Mi è difficile descrivere ciò che provo per gli altri.",
  "Preferisco lasciare che le cose seguano il loro corso piuttosto che capire perché sono andate in quel modo.",
  "Provo sentimenti che non riesco ad identificare.",
  "È essenziale essere in contatto con le proprie emozioni.",
  "Sono spesso disorientato dalle sensazioni che provo nel mio corpo.",
  "Gli altri mi chiedono di parlare di più dei miei sentimenti.",
  "Non riesco a capire cosa stia accadendo dentro di me.",
  "Spesso non so perché mi arrabbio.",
  "Con le persone preferisco parlare delle cose di tutti i giorni piuttosto che delle loro emozioni.",
  "Preferisco vedere spettacoli leggeri piuttosto che a sfondo psicologico.",
  "Mi è difficile rivelare i miei sentimenti più profondi anche agli amici più intimi.",
  "Posso sentirmi vicino a una persona anche se siamo in silenzio.",
  "Trovo che l'esame dei miei sentimenti mi serve a risolvere i miei problemi personali.",
  "Cercare significati nascosti in film o commedie distoglie dal piacere dello spettacolo.",
];

// Reverse-scored items (positive items that need reversal: 1→5, 2→4, 3→3, 4→2, 5→1)
const REVERSE_ITEMS: number[] = [4, 5, 10, 18, 19];

const questions: Question[] = QUESTIONS_1_20.map(
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

export const TAS20_SELF: QuestionnaireDef = {
  code: "TAS20_SELF",
  formCode: "TAS20_SELF",
  type: "SELF",
  name: "TAS_20_SELF",
  instruction:
    "In questo questionario le si chiede gentilmente di indicare quanto è d'accordo oppure no con le seguenti affermazioni. Selezioni solo una risposta per ciascuna frase, quella che meglio descrive il suo pensiero.",
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito = "deficit" | "limite" | "";

/**
 * UI sometimes sends:
 * - "Per niente d'accordo__0"
 * - "1__0"
 * - { label: "Per niente d'accordo" }
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
    // Reverse: 1→5, 2→4, 3→3, 4→2, 5→1
    return 6 - rawScore;
  }

  return rawScore;
}

// ===============================
// COMPUTE
// ===============================

export function computeTAS20Self(answers: Record<string, any>) {
  // Get scores for all 20 questions
  const scores: number[] = [];
  for (let i = 1; i <= 20; i++) {
    scores.push(toScore(answers[qKey(i)], i));
  }

  // Difficoltà nell'identificare i sentimenti: items 1,3,6,7,9,13,14
  const identificare_items = [1, 3, 6, 7, 9, 13, 14];
  const identificare_punteggio = identificare_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Difficoltà nel comunicare i sentimenti agli altri: items 2,4,11,12,17
  const comunicare_items = [2, 4, 11, 12, 17];
  const comunicare_punteggio = comunicare_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Pensiero orientato all'esterno (pensiero operatorio): items 5,8,10,15,16,18,19,20
  const pensiero_esterno_items = [5, 8, 10, 15, 16, 18, 19, 20];
  const pensiero_esterno_punteggio = pensiero_esterno_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Scala totale: sum of all items
  const scala_totale = scores.reduce((a, b) => a + b, 0);

  // Determine ESITO based on thresholds
  function getScalaTotaleEsito(score: number): Esito {
    if (score >= 61) return "deficit";
    if (score >= 51 && score <= 60) return "limite";
    return "";
  }

  // Subscales use "*" marker for threshold
  function getSubscaleEsito(score: number, threshold: number): string {
    if (score >= threshold) return "*";
    return "";
  }

  return {
    // Main scale
    "Scala totale PG": String(scala_totale),
    "Scala totale ESITO": getScalaTotaleEsito(scala_totale),

    // Subscales
    "Difficoltà nell'identificare i sentimenti PG": String(
      identificare_punteggio,
    ),
    "Difficoltà nell'identificare i sentimenti ESITO": getSubscaleEsito(
      identificare_punteggio,
      22,
    ),

    "Difficoltà nel comunicare i sentimenti agli altri PG":
      String(comunicare_punteggio),
    "Difficoltà nel comunicare i sentimenti agli altri ESITO": getSubscaleEsito(
      comunicare_punteggio,
      16,
    ),

    "Pensiero orientato all'esterno (pensiero operatorio) PG": String(
      pensiero_esterno_punteggio,
    ),
    "Pensiero orientato all'esterno (pensiero operatorio) ESITO":
      getSubscaleEsito(pensiero_esterno_punteggio, 25),
  };
}
