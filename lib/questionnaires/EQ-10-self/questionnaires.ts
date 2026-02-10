import type { QuestionnaireDef, Question } from "../types";
import { qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF (EQ-10)
// ===============================

const OPTION_LABELS = [
  "Assolutamente d'accordo",
  "Parzialmente d'accordo",
  "Parzialmente in disaccordo",
  "Assolutamente in disaccordo",
] as const;

/**
 * We keep option `value` as a stable index (0..3).
 * Real scoring differs per item (some are reversed), handled in SCORING_MATRIX.
 */
const OPTIONS = OPTION_LABELS.map((label, idx) => ({
  label,
  value: idx,
}));

const QUESTIONS_1_10: string[] = [
  "Riesco facilmente a mettermi nei panni degli altri.",
  "Le persone mi dicono che sono bravo/a a comprendere cosa stanno provando o cosa stanno pensando.",
  "Non capisco perché la gente si offenda tanto per certe cose.",
  "Riesco facilmente a intuire di cosa il mio interlocutore desidera parlare.",
  "Non riesco sempre a capire perché qualcuno possa essersi sentito offeso da un commento.",
  "Riesco a entrare in sintonia con quello che qualcun altro sta provando in modo rapido e intuitivo.",
  "La gente mi dice spesso che sono insensibile sebbene io non sempre ne capisca il perché.",
  "In una conversazione tendo a focalizzarmi sulle mie idee piuttosto che su cosa potrebbe stare pensando il mio interlocutore.",
  "Gli amici spesso mi parlano dei loro problemi perché si sentono capiti.",
  "Trovo difficile capire come comportarmi in una situazione sociale.",
];

/**
 * Per-item scoring (from template):
 * Columns correspond to OPTION_LABELS order:
 * [Assolutamente d'accordo, Parzialmente d'accordo, Parzialmente in disaccordo, Assolutamente in disaccordo]
 */
const SCORING_MATRIX: number[][] = [
  [2, 1, 0, 0], // 1
  [2, 1, 0, 0], // 2
  [0, 0, 1, 2], // 3 (reverse)
  [2, 1, 0, 0], // 4
  [0, 0, 1, 2], // 5 (reverse)
  [2, 1, 0, 0], // 6
  [0, 0, 1, 2], // 7 (reverse)
  [0, 0, 1, 2], // 8 (reverse)
  [2, 1, 0, 0], // 9
  [0, 0, 1, 2], // 10 (reverse)
];

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

export const EQ10_SELF: QuestionnaireDef = {
  code: "EQ10_SELF",
  formCode: "EQ10_SELF",
  type: "SELF",
  name: "EQ10_SELF",
  instruction:
    "Indichi quanto è d’accordo o no con le seguenti affermazioni selezionando la risposta corrispondente. Selezioni gentilmente solo una risposta per ciascuna frase.",
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito = "sintomatico" | "";

/**
 * UI sometimes sends:
 * - "Assolutamente d'accordo__0"
 * - "0__0" / "1__0"
 * - { label: "Assolutamente d'accordo" }
 * - { value: 0 } / { id: 0 }
 * - 0
 */
function stripUiSuffix(v: unknown) {
  if (typeof v !== "string") return v;
  return v.split("__")[0].trim();
}

function labelToIndex(label: string): number {
  const s = label.trim().toLowerCase();
  return OPTION_LABELS.findIndex((x) => x.toLowerCase() === s);
}

function toChoiceIndex(ans: any): number | null {
  if (ans == null) return null;

  // number
  if (typeof ans === "number" && Number.isFinite(ans)) {
    const n = ans;
    // common cases: 0..3 (index) or 1..4 (index+1)
    if (n >= 0 && n <= 3) return n;
    if (n >= 1 && n <= 4) return n - 1;
    return null;
  }

  // string
  if (typeof ans === "string") {
    const s0 = String(stripUiSuffix(ans));
    const n = Number(s0);
    if (!Number.isNaN(n) && Number.isFinite(n)) {
      if (n >= 0 && n <= 3) return n;
      if (n >= 1 && n <= 4) return n - 1;
      return null;
    }
    const idx = labelToIndex(s0);
    return idx >= 0 ? idx : null;
  }

  // object
  if (typeof ans === "object") {
    const val = (ans as any).value ?? (ans as any).id ?? null;
    if (val != null) {
      const v0 = stripUiSuffix(val);
      const n = Number(v0);
      if (!Number.isNaN(n) && Number.isFinite(n)) {
        if (n >= 0 && n <= 3) return n;
        if (n >= 1 && n <= 4) return n - 1;
      }
    }

    const lab = (ans as any).label ?? null;
    if (lab != null) {
      const idx = labelToIndex(String(stripUiSuffix(lab)));
      return idx >= 0 ? idx : null;
    }
  }

  return null;
}

function toScore(ans: any, questionNumber: number): number {
  const idx = toChoiceIndex(ans);
  if (idx == null) return 0;

  const row = SCORING_MATRIX[questionNumber - 1];
  if (!row) return 0;

  const score = row[idx];
  return Number.isFinite(score) ? score : 0;
}

// ===============================
// COMPUTE
// ===============================

type Sex = "F" | "M" | null;

export type ComputeCtx = {
  patientSex?: string | null;
};

function normalizeSex(v: unknown): Sex {
  if (!v) return null;
  const s = String(v).trim().toLowerCase();

  if (s === "f" || s === "female" || s === "femmina" || s === "donna")
    return "F";
  if (s === "m" || s === "male" || s === "maschio" || s === "uomo") return "M";

  return null;
}

export function computeEQ10Self(
  answers: Record<string, any>,
  ctx?: ComputeCtx,
) {
  const scores: number[] = [];
  for (let i = 1; i <= 10; i++) {
    scores.push(toScore(answers[qKey(i)], i));
  }

  const eq10_totale = scores.reduce((a, b) => a + b, 0);

  // ✅ normalize sex safely
  const sex = normalizeSex(ctx?.patientSex);

  // ✅ apply gender-specific threshold ONLY if sex is known
  // Template: male <5 ; female <6
  const threshold = sex === "F" ? 6 : sex === "M" ? 5 : null;

  const esito: Esito =
    threshold == null ? "" : eq10_totale < threshold ? "sintomatico" : "";

  const cutoff = threshold == null ? "" : sex === "F" ? "<6" : "<5";

  return {
    "EQ-10 totale PG": String(eq10_totale),
    "EQ-10 totale CUTOFF": cutoff,
    "EQ-10 totale ESITO": esito,
    "Gender used": sex ?? "",
  };
}
