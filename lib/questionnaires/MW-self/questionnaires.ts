import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

// Part 1: Questions 1-8 (scale 1-7)
const OPTIONS_1_7 = [
  { label: "1 (Raramente)", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7 (Moltissimo)", value: 7 },
] as const;

const QUESTIONS_1_8: string[] = [
  "Mi accorgo che la mia mente vaga liberamente, indipendentemente dalla mia volontà",
  "Quando la mia mente vaga i miei pensieri tendono a saltare da un argomento all'altro",
  "La mia mente si mette a vagare anche quando dovrei essere concentrato su qualcos'altro",
  "Quando la mia mente vaga liberamente, mi sembra di non avere il controllo sui miei pensieri",
  "Lascio intenzionalmente che i miei pensieri vaghino per conto loro",
  "Mi piace quando la mia mente vaga per conto suo",
  "Mi lascio assorbire da fantasie piacevoli",
  "Trovo che vagare con la mente sia un buon modo per affrontare la noia",
];

// Part 2: Questions 9-16 (scale 1-5)
const OPTIONS_1_5 = [
  { label: "1 (Quasi mai)", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5 (Sempre)", value: 5 },
] as const;

const QUESTIONS_9_16: string[] = [
  "Quando passo da un compito ad un altro, sono lento nel rifocalizzare l'attenzione",
  "Mi ci vuole un po' prima di riuscire a concentrarmi su un compito nuovo",
  "Mi risulta difficile alternarmi tra due compiti differenti",
  "Dopo essere stato interrotto, ho difficoltà a riportare la mia attenzione su quello che stavo facendo prima",
  "Ho difficoltà a concentrarmi quando c'è della musica nella stanza dove mi trovo",
  "Quando lavoro intensamente a qualcosa, mi capita di essere distratto da ciò che succede intorno a me",
  "Faccio molta fatica a concentrarmi su un compito difficile quando c'è rumore intorno a me",
  "Quando sto leggendo o studiando, mi distraggo facilmente se ci sono persone che parlano nella stessa stanza",
];

const questions: Question[] = [];

// Add Part 1 questions (1-8)
QUESTIONS_1_8.forEach((text, i) => {
  questions.push({
    key: `q${i + 1}`,
    number: i + 1,
    text,
    type: "single_choice",
    required: true,
    options: [...OPTIONS_1_7],
  });
});

// Add instruction between parts
questions.push({
  key: "instruction_part2",
  number: null as any,
  text: "Per ognuna delle seguenti affermazioni indichi per favore l'alternativa di risposta che riflette nel modo più accurato la sua esperienza quotidiana.",
  type: "instruction" as any,
  required: false,
  options: [],
} as any);

// Add Part 2 questions (9-16)
QUESTIONS_9_16.forEach((text, i) => {
  questions.push({
    key: `q${i + 9}`,
    number: i + 9,
    text,
    type: "single_choice",
    required: true,
    options: [...OPTIONS_1_5],
  });
});

export const MW_SELF: QuestionnaireDef = {
  code: "MW_SELF",
  formCode: "MW_SELF",
  type: "SELF",
  name: "MW_SELF",
  instruction:
    "Per ognuna delle seguenti affermazioni indichi per favore l'alternativa di risposta che riflette nel modo più accurato la sua esperienza quotidiana.",
  questions,
};

// ===============================
// AGE-BASED NORMS
// ===============================

type Esito = "fortemente sintomatico" | "sintomatico" | "limite" | "";
type AgeGroup = "under_30" | "age_30_plus";

type NormRow = { pg: number; stat: string; esito: Esito };

type ScaleNorms = {
  under_30: NormRow[];
  age_30_plus: NormRow[];
};

// MW-S Norms (Mind Wandering - Spontaneo)
const MW_S_NORMS: ScaleNorms = {
  under_30: [
    { pg: 4, stat: "1°", esito: "" },
    { pg: 5, stat: "2°", esito: "" },
    { pg: 6, stat: "3°", esito: "" },
    { pg: 7, stat: "5°", esito: "" },
    { pg: 8, stat: "7°", esito: "" },
    { pg: 9, stat: "9°", esito: "" },
    { pg: 10, stat: "13°", esito: "" },
    { pg: 11, stat: "17°", esito: "" },
    { pg: 12, stat: "22°", esito: "" },
    { pg: 13, stat: "27°", esito: "" },
    { pg: 14, stat: "34°", esito: "" },
    { pg: 15, stat: "40°", esito: "" },
    { pg: 16, stat: "47°", esito: "" },
    { pg: 17, stat: "54°", esito: "" },
    { pg: 18, stat: "61°", esito: "" },
    { pg: 19, stat: "68°", esito: "" },
    { pg: 20, stat: "74°", esito: "" },
    { pg: 21, stat: "79°", esito: "" },
    { pg: 22, stat: "84°", esito: "limite" },
    { pg: 23, stat: "88°", esito: "limite" },
    { pg: 24, stat: "91°", esito: "limite" },
    { pg: 25, stat: "94°", esito: "limite" },
    { pg: 26, stat: "96°", esito: "sintomatico" },
    { pg: 27, stat: "97°", esito: "sintomatico" },
    { pg: 28, stat: "98°", esito: "sintomatico" },
  ],
  age_30_plus: [
    { pg: 4, stat: "6°", esito: "" },
    { pg: 5, stat: "10°", esito: "" },
    { pg: 6, stat: "14°", esito: "" },
    { pg: 7, stat: "18°", esito: "" },
    { pg: 8, stat: "24°", esito: "" },
    { pg: 9, stat: "30°", esito: "" },
    { pg: 10, stat: "36°", esito: "" },
    { pg: 11, stat: "42°", esito: "" },
    { pg: 12, stat: "48°", esito: "" },
    { pg: 13, stat: "54°", esito: "" },
    { pg: 14, stat: "60°", esito: "" },
    { pg: 15, stat: "66°", esito: "" },
    { pg: 16, stat: "71°", esito: "" },
    { pg: 17, stat: "76°", esito: "" },
    { pg: 18, stat: "80°", esito: "" },
    { pg: 19, stat: "84°", esito: "limite" },
    { pg: 20, stat: "87°", esito: "limite" },
    { pg: 21, stat: "90°", esito: "limite" },
    { pg: 22, stat: "92°", esito: "limite" },
    { pg: 23, stat: "94°", esito: "limite" },
    { pg: 24, stat: "96°", esito: "sintomatico" },
    { pg: 25, stat: "97°", esito: "sintomatico" },
    { pg: 26, stat: "98°", esito: "sintomatico" },
    { pg: 27, stat: "98°", esito: "sintomatico" },
    { pg: 28, stat: "99°", esito: "fortemente sintomatico" },
  ],
};

// MW-D Norms (Mind Wandering - Deliberato)
const MW_D_NORMS: ScaleNorms = {
  under_30: [
    { pg: 4, stat: "1°", esito: "" },
    { pg: 5, stat: "1°", esito: "" },
    { pg: 6, stat: "2°", esito: "" },
    { pg: 7, stat: "3°", esito: "" },
    { pg: 8, stat: "4°", esito: "" },
    { pg: 9, stat: "6°", esito: "" },
    { pg: 10, stat: "8°", esito: "" },
    { pg: 11, stat: "11°", esito: "" },
    { pg: 12, stat: "15°", esito: "" },
    { pg: 13, stat: "19°", esito: "" },
    { pg: 14, stat: "25°", esito: "" },
    { pg: 15, stat: "31°", esito: "" },
    { pg: 16, stat: "37°", esito: "" },
    { pg: 17, stat: "44°", esito: "" },
    { pg: 18, stat: "51°", esito: "" },
    { pg: 19, stat: "58°", esito: "" },
    { pg: 20, stat: "65°", esito: "" },
    { pg: 21, stat: "71°", esito: "" },
    { pg: 22, stat: "77°", esito: "" },
    { pg: 23, stat: "82°", esito: "" },
    { pg: 24, stat: "87°", esito: "limite" },
    { pg: 25, stat: "90°", esito: "limite" },
    { pg: 26, stat: "93°", esito: "limite" },
    { pg: 27, stat: "95°", esito: "sintomatico" },
    { pg: 28, stat: "97°", esito: "sintomatico" },
  ],
  age_30_plus: [
    { pg: 4, stat: "4°", esito: "" },
    { pg: 5, stat: "6°", esito: "" },
    { pg: 6, stat: "8°", esito: "" },
    { pg: 7, stat: "11°", esito: "" },
    { pg: 8, stat: "14°", esito: "" },
    { pg: 9, stat: "17°", esito: "" },
    { pg: 10, stat: "22°", esito: "" },
    { pg: 11, stat: "27°", esito: "" },
    { pg: 12, stat: "32°", esito: "" },
    { pg: 13, stat: "38°", esito: "" },
    { pg: 14, stat: "44°", esito: "" },
    { pg: 15, stat: "51°", esito: "" },
    { pg: 16, stat: "57°", esito: "" },
    { pg: 17, stat: "63°", esito: "" },
    { pg: 18, stat: "69°", esito: "" },
    { pg: 19, stat: "74°", esito: "" },
    { pg: 20, stat: "79°", esito: "" },
    { pg: 21, stat: "83°", esito: "" },
    { pg: 22, stat: "87°", esito: "limite" },
    { pg: 23, stat: "90°", esito: "limite" },
    { pg: 24, stat: "92°", esito: "limite" },
    { pg: 25, stat: "94°", esito: "limite" },
    { pg: 26, stat: "96°", esito: "sintomatico" },
    { pg: 27, stat: "97°", esito: "sintomatico" },
    { pg: 28, stat: "98°", esito: "sintomatico" },
  ],
};

// AC-D Norms (Controllo Attentivo - Distrazione)
const AC_D_NORMS: ScaleNorms = {
  under_30: [
    { pg: 4, stat: "1°", esito: "" },
    { pg: 5, stat: "2°", esito: "" },
    { pg: 6, stat: "3°", esito: "" },
    { pg: 7, stat: "6°", esito: "" },
    { pg: 8, stat: "10°", esito: "" },
    { pg: 9, stat: "15°", esito: "" },
    { pg: 10, stat: "22°", esito: "" },
    { pg: 11, stat: "31°", esito: "" },
    { pg: 12, stat: "40°", esito: "" },
    { pg: 13, stat: "51°", esito: "" },
    { pg: 14, stat: "61°", esito: "" },
    { pg: 15, stat: "71°", esito: "" },
    { pg: 16, stat: "79°", esito: "" },
    { pg: 17, stat: "86°", esito: "limite" },
    { pg: 18, stat: "91°", esito: "limite" },
    { pg: 19, stat: "95°", esito: "sintomatico" },
    { pg: 20, stat: "97°", esito: "sintomatico" },
  ],
  age_30_plus: [
    { pg: 4, stat: "4°", esito: "" },
    { pg: 5, stat: "6°", esito: "" },
    { pg: 6, stat: "10°", esito: "" },
    { pg: 7, stat: "15°", esito: "" },
    { pg: 8, stat: "22°", esito: "" },
    { pg: 9, stat: "30°", esito: "" },
    { pg: 10, stat: "39°", esito: "" },
    { pg: 11, stat: "48°", esito: "" },
    { pg: 12, stat: "58°", esito: "" },
    { pg: 13, stat: "67°", esito: "" },
    { pg: 14, stat: "76°", esito: "" },
    { pg: 15, stat: "83°", esito: "" },
    { pg: 16, stat: "88°", esito: "limite" },
    { pg: 17, stat: "92°", esito: "limite" },
    { pg: 18, stat: "95°", esito: "sintomatico" },
    { pg: 19, stat: "97°", esito: "sintomatico" },
    { pg: 20, stat: "99°", esito: "fortemente sintomatico" },
  ],
};

// AC-S Norms (Controllo Attentivo - Shifting)
const AC_S_NORMS: ScaleNorms = {
  under_30: [
    { pg: 4, stat: "4°", esito: "" },
    { pg: 5, stat: "9°", esito: "" },
    { pg: 6, stat: "16°", esito: "" },
    { pg: 7, stat: "25°", esito: "" },
    { pg: 8, stat: "35°", esito: "" },
    { pg: 9, stat: "45°", esito: "" },
    { pg: 10, stat: "56°", esito: "" },
    { pg: 11, stat: "65°", esito: "" },
    { pg: 12, stat: "74°", esito: "" },
    { pg: 13, stat: "81°", esito: "" },
    { pg: 14, stat: "86°", esito: "limite" },
    { pg: 15, stat: "90°", esito: "limite" },
    { pg: 16, stat: "93°", esito: "limite" },
    { pg: 17, stat: "95°", esito: "sintomatico" },
    { pg: 18, stat: "97°", esito: "sintomatico" },
    { pg: 19, stat: "98°", esito: "sintomatico" },
    { pg: 20, stat: "99°", esito: "fortemente sintomatico" },
  ],
  age_30_plus: [
    { pg: 4, stat: "11°", esito: "" },
    { pg: 5, stat: "19°", esito: "" },
    { pg: 6, stat: "29°", esito: "" },
    { pg: 7, stat: "40°", esito: "" },
    { pg: 8, stat: "51°", esito: "" },
    { pg: 9, stat: "61°", esito: "" },
    { pg: 10, stat: "71°", esito: "" },
    { pg: 11, stat: "78°", esito: "" },
    { pg: 12, stat: "84°", esito: "limite" },
    { pg: 13, stat: "89°", esito: "limite" },
    { pg: 14, stat: "93°", esito: "limite" },
    { pg: 15, stat: "95°", esito: "sintomatico" },
    { pg: 16, stat: "97°", esito: "sintomatico" },
    { pg: 17, stat: "98°", esito: "sintomatico" },
    { pg: 18, stat: "99°", esito: "fortemente sintomatico" },
    { pg: 19, stat: "99°", esito: "fortemente sintomatico" },
    { pg: 20, stat: "99°", esito: "fortemente sintomatico" },
  ],
};

// ===============================
// HELPERS
// ===============================

function getAgeGroup(age: number | null | undefined): AgeGroup {
  if (age == null || age < 30) return "under_30";
  return "age_30_plus";
}

function classify(
  score: number,
  norms: ScaleNorms,
  ageGroup: AgeGroup,
): { stat: string; esito: Esito } {
  const rows = norms[ageGroup];
  const match = rows.find((r) => r.pg === score);
  if (match) return { stat: match.stat, esito: match.esito };
  return { stat: "", esito: "" };
}

function stripUiSuffix(v: unknown) {
  if (typeof v !== "string") return v;
  return v.split("__")[0].trim();
}

function toScore(ans: any): number {
  if (ans == null) return 0;

  if (typeof ans === "number") return Number.isFinite(ans) ? ans : 0;

  if (typeof ans === "string") {
    const s0 = String(stripUiSuffix(ans));
    const n = Number(s0);
    if (!Number.isNaN(n) && Number.isFinite(n)) return n;
    return scoreFromLabel(s0);
  }

  if (typeof ans === "object") {
    const val = (ans as any).value ?? (ans as any).id ?? null;
    if (val != null) {
      const v0 = stripUiSuffix(val);
      const n = Number(v0);
      if (!Number.isNaN(n) && Number.isFinite(n)) return n;
    }
    const lab = (ans as any).label ?? null;
    if (lab != null) return scoreFromLabel(String(stripUiSuffix(lab)));
  }

  return 0;
}

// ===============================
// COMPUTE
// ===============================

export type ComputeCtx = { patientAge?: number | null };

export function computeMWSelf(answers: Record<string, any>, ctx?: ComputeCtx) {
  // MW-D: items 1,2,3,4 (questions 1-4)
  const mw_d_items = [1, 2, 3, 4];
  const mw_d_score = mw_d_items
    .map((i) => toScore(answers[qKey(i)]))
    .reduce((a, b) => a + b, 0);

  // MW-S: items 5,6,7,8 (questions 5-8)
  const mw_s_items = [5, 6, 7, 8];
  const mw_s_score = mw_s_items
    .map((i) => toScore(answers[qKey(i)]))
    .reduce((a, b) => a + b, 0);

  // AC-S: items 9,10,11,12 (questions 9-12)
  const ac_s_items = [9, 10, 11, 12];
  const ac_s_score = ac_s_items
    .map((i) => toScore(answers[qKey(i)]))
    .reduce((a, b) => a + b, 0);

  // AC-D: items 13,14,15,16 (questions 13-16)
  const ac_d_items = [13, 14, 15, 16];
  const ac_d_score = ac_d_items
    .map((i) => toScore(answers[qKey(i)]))
    .reduce((a, b) => a + b, 0);

  // Determine age group
  const ageGroup = getAgeGroup(ctx?.patientAge);

  // Classify scores
  const mw_s = classify(mw_s_score, MW_S_NORMS, ageGroup);
  const mw_d = classify(mw_d_score, MW_D_NORMS, ageGroup);
  const ac_d = classify(ac_d_score, AC_D_NORMS, ageGroup);
  const ac_s = classify(ac_s_score, AC_S_NORMS, ageGroup);

  return {
    "MW-S PG": String(mw_s_score),
    "MW-S STAT": mw_s.stat,
    "MW-S ESITO": mw_s.esito,

    "MW-D PG": String(mw_d_score),
    "MW-D STAT": mw_d.stat,
    "MW-D ESITO": mw_d.esito,

    "AC-D PG": String(ac_d_score),
    "AC-D STAT": ac_d.stat,
    "AC-D ESITO": ac_d.esito,

    "AC-S PG": String(ac_s_score),
    "AC-S STAT": ac_s.stat,
    "AC-S ESITO": ac_s.esito,

    "Age group used": ageGroup === "under_30" ? "<30" : "30+",
  };
}
