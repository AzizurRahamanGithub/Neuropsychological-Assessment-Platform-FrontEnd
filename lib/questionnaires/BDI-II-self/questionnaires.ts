import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

// BDI-II has 21 items, each is a group of 4 statements scored 0-3
// The user selects ONE statement from each group that best describes their feelings

const OPTIONS = [
  { label: "0", id: "0" },
  { label: "1", id: "1" },
  { label: "2", id: "2" },
  { label: "3", id: "3" },
] as const;

const ITEM_NAMES = [
  "Tristezza",
  "Pessimismo",
  "Fallimento",
  "Perdita di piacere",
  "Senso di colpa",
  "Sentimenti di punizione",
  "Autostima",
  "Autocritica",
  "Suicidio",
  "Pianto",
  "Agitazione",
  "Perdita di interessi",
  "Indecisione",
  "Senso di inutilità",
  "Perdita di energia",
  "Sonno",
  "Irritabilità",
  "Appetito",
  "Concentrazione",
  "Fatica",
  "Sesso",
];

const questions: Question[] = ITEM_NAMES.map(
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

export const BDI_II_SELF: QuestionnaireDef = {
  code: "BDI_II_SELF",
  formCode: "BDI_II_SELF",
  type: "SELF",
  name: "BDI_II_SELF",
  instruction:
    'Per favore legga attentamente le affermazioni seguenti, selezionando quella che meglio descrive come Lei si è sentito nelle ultime due settimane (incluso oggi). Se più di un\'affermazione della stessa tematica descrive ugualmente bene come Lei si sente, selezioni l\'affermazione contrassegnata dal numero più elevato. Non scelga più di una affermazione per ciascuna tematica, incluse la domanda 16 ("Sonno") e la domanda 18 ("Appetito"). È importante ricordare che non ci sono risposte giuste o sbagliate. Non si soffermi troppo su ogni affermazione: la prima risposta è spesso la più accurata.',
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito = "fortemente sintomatico" | "sintomatico" | "limite" | "";
type Stat = string;

function stripUiSuffix(v: unknown) {
  if (typeof v !== "string") return v;
  return v.split("__")[0].trim();
}

function toScore(ans: any): number {
  if (ans == null) return 0;

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

  return rawScore;
}

// ===============================
// GENDER-BASED NORMS
// ===============================

type NormRow = { minPG: number; maxPG: number; stat: Stat; esito: Esito };

const NORMS_MALE = {
  scala_totale: [
    { minPG: 0, maxPG: 0, stat: "20°", esito: "" },
    { minPG: 1, maxPG: 1, stat: "30°", esito: "" },
    { minPG: 2, maxPG: 2, stat: "40°", esito: "" },
    { minPG: 3, maxPG: 3, stat: "50°", esito: "" },
    { minPG: 4, maxPG: 5, stat: "60°", esito: "" },
    { minPG: 6, maxPG: 8, stat: "70°", esito: "" },
    { minPG: 9, maxPG: 10, stat: "80°", esito: "" },
    { minPG: 11, maxPG: 11, stat: "85°", esito: "limite" },
    { minPG: 12, maxPG: 14, stat: "90°", esito: "limite" },
    { minPG: 15, maxPG: 15, stat: "92°", esito: "limite" },
    { minPG: 16, maxPG: 16, stat: "94°", esito: "limite" },
    { minPG: 17, maxPG: 19, stat: "96°", esito: "sintomatico" },
    { minPG: 20, maxPG: 20, stat: "97°", esito: "sintomatico" },
    { minPG: 21, maxPG: 21, stat: "98°", esito: "sintomatico" },
    { minPG: 22, maxPG: 63, stat: "99°", esito: "fortemente sintomatico" },
  ] as NormRow[],
  fattore_somatico: [
    { minPG: 0, maxPG: 0, stat: "20°", esito: "" },
    { minPG: 1, maxPG: 1, stat: "40°", esito: "" },
    { minPG: 2, maxPG: 2, stat: "50°", esito: "" },
    { minPG: 3, maxPG: 3, stat: "60°", esito: "" },
    { minPG: 4, maxPG: 5, stat: "70°", esito: "" },
    { minPG: 6, maxPG: 7, stat: "80°", esito: "" },
    { minPG: 8, maxPG: 8, stat: "85°", esito: "limite" },
    { minPG: 9, maxPG: 10, stat: "90°", esito: "limite" },
    { minPG: 11, maxPG: 11, stat: "95°", esito: "sintomatico" },
    { minPG: 12, maxPG: 12, stat: "97°", esito: "sintomatico" },
    { minPG: 13, maxPG: 14, stat: "98°", esito: "sintomatico" },
    { minPG: 15, maxPG: 42, stat: "99°", esito: "fortemente sintomatico" },
  ] as NormRow[],
  fattore_cognitivo: [
    { minPG: 0, maxPG: 0, stat: "50°", esito: "" },
    { minPG: 1, maxPG: 1, stat: "70°", esito: "" },
    { minPG: 2, maxPG: 2, stat: "80°", esito: "" },
    { minPG: 3, maxPG: 3, stat: "85°", esito: "limite" },
    { minPG: 4, maxPG: 4, stat: "90°", esito: "limite" },
    { minPG: 5, maxPG: 5, stat: "94°", esito: "limite" },
    { minPG: 6, maxPG: 6, stat: "95°", esito: "sintomatico" },
    { minPG: 7, maxPG: 7, stat: "97°", esito: "sintomatico" },
    { minPG: 8, maxPG: 21, stat: "99°", esito: "fortemente sintomatico" },
  ] as NormRow[],
};

const NORMS_FEMALE = {
  scala_totale: [
    { minPG: 0, maxPG: 1, stat: "20°", esito: "" },
    { minPG: 2, maxPG: 2, stat: "30°", esito: "" },
    { minPG: 3, maxPG: 4, stat: "40°", esito: "" },
    { minPG: 5, maxPG: 6, stat: "50°", esito: "" },
    { minPG: 7, maxPG: 8, stat: "60°", esito: "" },
    { minPG: 9, maxPG: 11, stat: "70°", esito: "" },
    { minPG: 12, maxPG: 13, stat: "80°", esito: "" },
    { minPG: 14, maxPG: 14, stat: "85°", esito: "limite" },
    { minPG: 15, maxPG: 17, stat: "90°", esito: "limite" },
    { minPG: 18, maxPG: 18, stat: "93°", esito: "limite" },
    { minPG: 19, maxPG: 19, stat: "95°", esito: "sintomatico" },
    { minPG: 20, maxPG: 20, stat: "97°", esito: "sintomatico" },
    { minPG: 21, maxPG: 21, stat: "98°", esito: "sintomatico" },
    { minPG: 22, maxPG: 63, stat: "99°", esito: "fortemente sintomatico" },
  ] as NormRow[],
  fattore_somatico: [
    { minPG: 0, maxPG: 0, stat: "20°", esito: "" },
    { minPG: 1, maxPG: 1, stat: "30°", esito: "" },
    { minPG: 2, maxPG: 3, stat: "40°", esito: "" },
    { minPG: 4, maxPG: 4, stat: "50°", esito: "" },
    { minPG: 5, maxPG: 6, stat: "60°", esito: "" },
    { minPG: 7, maxPG: 8, stat: "70°", esito: "" },
    { minPG: 9, maxPG: 10, stat: "80°", esito: "" },
    { minPG: 11, maxPG: 12, stat: "85°", esito: "limite" },
    { minPG: 13, maxPG: 13, stat: "90°", esito: "limite" },
    { minPG: 14, maxPG: 15, stat: "92°", esito: "limite" },
    { minPG: 16, maxPG: 16, stat: "95°", esito: "sintomatico" },
    { minPG: 17, maxPG: 17, stat: "97°", esito: "sintomatico" },
    { minPG: 18, maxPG: 18, stat: "98°", esito: "sintomatico" },
    { minPG: 19, maxPG: 42, stat: "99°", esito: "fortemente sintomatico" },
  ] as NormRow[],
  fattore_cognitivo: [
    { minPG: 0, maxPG: 0, stat: "40°", esito: "" },
    { minPG: 1, maxPG: 1, stat: "60°", esito: "" },
    { minPG: 2, maxPG: 2, stat: "70°", esito: "" },
    { minPG: 3, maxPG: 3, stat: "80°", esito: "" },
    { minPG: 4, maxPG: 4, stat: "90°", esito: "limite" },
    { minPG: 5, maxPG: 5, stat: "92°", esito: "limite" },
    { minPG: 6, maxPG: 6, stat: "95°", esito: "sintomatico" },
    { minPG: 7, maxPG: 8, stat: "96°", esito: "sintomatico" },
    { minPG: 9, maxPG: 9, stat: "98°", esito: "sintomatico" },
    { minPG: 10, maxPG: 21, stat: "99°", esito: "fortemente sintomatico" },
  ] as NormRow[],
};

function classify(
  score: number,
  rows: NormRow[],
): { stat: Stat; esito: Esito } {
  for (const row of rows) {
    if (score >= row.minPG && score <= row.maxPG) {
      return { stat: row.stat, esito: row.esito };
    }
  }
  return { stat: "", esito: "" };
}

// ===============================
// COMPUTE
// ===============================

export type ComputeCtx = {
  patientSex?: string | null;
  patientGender?: string | null;
};

type Sex = "M" | "F" | null;

function normalizeSex(v: unknown): Sex {
  if (!v) return null;
  const s = String(v).trim().toUpperCase();
  if (s === "F" || s === "FEMALE") return "F";
  if (s === "M" || s === "MALE") return "M";
  return null;
}

export function computeBDIIISelf(
  answers: Record<string, any>,
  ctx?: ComputeCtx,
) {
  // Get scores for all 21 questions
  const scores: number[] = [];
  for (let i = 1; i <= 21; i++) {
    scores.push(toScore(answers[qKey(i)]));
  }

  const sex = normalizeSex(ctx?.patientSex ?? ctx?.patientGender);
  const genderUsed = sex === "F" ? "FEMALE" : sex === "M" ? "MALE" : "MALE";

  const norms = sex === "F" ? NORMS_FEMALE : NORMS_MALE;

  // Scala totale: sum of all 21 items
  const scala_totale = scores.reduce((a, b) => a + b, 0);
  const result_totale = classify(scala_totale, norms.scala_totale);

  // Fattore somatico-affettivo: items 1,2,4,9,10,11,12,15,16,17,18,19,20,21
  const somatico_items = [1, 2, 4, 9, 10, 11, 12, 15, 16, 17, 18, 19, 20, 21];
  const fattore_somatico = somatico_items.reduce(
    (sum, i) => sum + scores[i - 1],
    0,
  );
  const result_somatico = classify(fattore_somatico, norms.fattore_somatico);

  // Fattore cognitivo: items 3,5,6,7,8,13,14
  const cognitivo_items = [3, 5, 6, 7, 8, 13, 14];
  const fattore_cognitivo = cognitivo_items.reduce(
    (sum, i) => sum + scores[i - 1],
    0,
  );
  const result_cognitivo = classify(fattore_cognitivo, norms.fattore_cognitivo);

  return {
    "Scala totale PG": String(scala_totale),
    "Scala totale STAT": result_totale.stat,
    "Scala totale ESITO": result_totale.esito,

    "Fattore somatico-affettivo PG": String(fattore_somatico),
    "Fattore somatico-affettivo STAT": result_somatico.stat,
    "Fattore somatico-affettivo ESITO": result_somatico.esito,

    "Fattore cognitivo PG": String(fattore_cognitivo),
    "Fattore cognitivo STAT": result_cognitivo.stat,
    "Fattore cognitivo ESITO": result_cognitivo.esito,

    "Gender used": genderUsed,
  };
}
