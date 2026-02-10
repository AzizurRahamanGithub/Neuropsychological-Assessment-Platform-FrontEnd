import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS = [
  { label: "Assolutamente d'accordo", value: 1 },
  { label: "Parzialmente d'accordo", value: 1 },
  { label: "Parzialmente in disaccordo", value: 0 },
  { label: "Assolutamente in disaccordo", value: 0 },
] as const;

const QUESTIONS_1_10: string[] = [
  "Spesso noto piccoli suoni che gli altri non notano.",
  "Di solito mi concentro di più sull'intera figura che sui piccoli dettagli.",
  "Trovo semplice fare più di una cosa contemporaneamente.",
  "Se c'è un'interruzione, posso ritornare a ciò che stavo facendo molto velocemente.",
  "Trovo semplice 'leggere tra le righe' quando qualcuno mi parla.",
  "So distinguere se chi mi ascolta si sta annoiando.",
  "Quando leggo una storia, trovo difficile capire le intenzioni dei personaggi.",
  "Mi piace raccogliere informazioni su categorie di cose (per esempio, tipi di macchine, tipi di uccelli, tipi di treni, tipi di piante, ecc.).",
  "Trovo semplice capire cosa una persona sta pensando o provando, semplicemente guardandola in faccia.",
  "Trovo difficile capire le intenzioni delle persone.",
];

// Reverse-scored items (items that indicate good social/cognitive functioning)
// Items 2, 3, 4, 5, 6, 9 are reverse scored
const REVERSE_ITEMS: number[] = [2, 3, 4, 5, 6, 9];

const questions: Question[] = QUESTIONS_1_10.map(
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

export const AQ10_SELF: QuestionnaireDef = {
  code: "AQ10_SELF",
  formCode: "AQ10_SELF",
  type: "SELF",
  name: "AQ10_SELF",
  instruction:
    "Indichi quanto è d'accordo o no con le seguenti affermazioni selezionando la risposta corrispondente. Selezioni gentilmente solo una risposta per ciascuna frase.",
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito = "sintomatico" | "";

/**
 * UI sometimes sends:
 * - "Assolutamente d'accordo__0"
 * - "1__0"
 * - { label: "Assolutamente d'accordo" }
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
    // Reverse: 0→1, 1→0
    return 1 - rawScore;
  }

  return rawScore;
}

// ===============================
// COMPUTE
// ===============================

export type ComputeCtx = {
  patientSex?: string | null; // accepts "F"/"M" or "female"/"male" etc.
};

type Sex = "M" | "F" | null;

function normalizeSex(v: unknown): Sex {
  if (!v) return null;
  const s = String(v).trim().toLowerCase();

  if (s === "f" || s === "female" || s === "femmina" || s === "donna")
    return "F";
  if (s === "m" || s === "male" || s === "maschio" || s === "uomo") return "M";

  return null;
}

export function computeAQ10Self(
  answers: Record<string, any>,
  ctx?: ComputeCtx,
) {
  // Get scores for all 10 questions
  const scores: number[] = [];
  for (let i = 1; i <= 10; i++) {
    scores.push(toScore(answers[qKey(i)], i));
  }

  // AQ-10 totale: sum of all items
  const aq10_totale = scores.reduce((a, b) => a + b, 0);

  // ✅ normalize sex safely (prevents wrong MALE default)
  const sex = normalizeSex(ctx?.patientSex);

  // Debug label (keep consistent with your other questionnaires)
  const genderUsed = sex === "F" ? "FEMALE" : sex === "M" ? "MALE" : "";

  // For males: >6, For females: >5
  const threshold = sex === "F" ? 5 : sex === "M" ? 6 : null;

  const esito: Esito =
    threshold == null ? "" : aq10_totale > threshold ? "sintomatico" : "";

  const cutoff = threshold == null ? "" : sex === "F" ? ">5" : ">6";

  return {
    "AQ-10 totale PG": String(aq10_totale),
    "AQ-10 totale CUTOFF": cutoff,
    "AQ-10 totale ESITO": esito,
    "Gender used": genderUsed,
  };
}
