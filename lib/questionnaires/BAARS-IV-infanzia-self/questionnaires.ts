import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS_1_4 = [
  { label: "Mai o raramente", value: 1 },
  { label: "Qualche volta", value: 2 },
  { label: "Spesso", value: 3 },
  { label: "Molto spesso", value: 4 },
] as const;


const QUESTIONS_1_18: string[] = [
  "Non prestavo adeguata attenzione ai dettagli o commettevo errori di distrazione",
  "Avevo difficoltà a mantenere l’attenzione sui compiti o in attività di svago",
  "Non ascoltavo quando gli altri mi parlavano",
  "Non seguivo le istruzioni e non portavo a termine i compiti o i miei doveri",
  "Avevo difficoltà ad organizzare i compiti e le attività da svolgere",
  "Evitavo o ero riluttante a impegnarmi in attività che richiedevano uno sforzo mentale sostenuto",
  "Perdevo le cose che mi servivano per i compiti o le attività da svolgere",
  "Venivo distratto/a facilmente da stimoli estranei o da pensieri irrilevanti",
  "Ero sbadato/a nelle attività quotidiane",

  "Muovevo di continuo mani e piedi o mi agitavo quando ero seduto/a",
  "Mi alzavo dalla sedia quando avrei dovuto stare seduto/a",
  "Mi spostavo continuamente o mi sentivo inquieto/a",
  "Avevo difficoltà a intraprendere attività di svago in modo tranquillo",
  "Ero “in movimento” come se fossi guidato/a da un motore",
  "Parlavo eccessivamente (in situazioni sociali)",
  "Rispondevo impulsivamente prima che finissero le domande",
  "Avevo difficoltà ad aspettare il mio turno",
  "Interrompevo o mi inserivo nelle conversazioni o attività altrui",
];

const questions: Question[] = QUESTIONS_1_18.map(
  (text, i) =>
    ({
      key: `q${i + 1}`,
      number: i + 1,
      text,
      type: "single_choice",
      required: true,
      options: [...OPTIONS_1_4],
    }) satisfies Question,
);

// Q19 – environments (multiple choice)
questions.push({
  key: "q19",
  number: 19,
  text: "In quali ambienti i sintomi Le davano problemi? (selezioni tutte le situazioni)",
  type: "multiple_choice",
  required: true,
  options: [
    { label: "Scuola" },
    { label: "Casa" },
    { label: "Lavoro" },
    { label: "Situazioni sociali" },
  ],
});

export const BAARS_IV_INFANZIA_SELF: QuestionnaireDef = {
  code: "BAARS_IV_INFANZIA_SELF",
  formCode: "BAARS_IV_INFANZIA_SELF",
  type: "SELF",
  name: "BAARS_IV_INFANZIA_SELF",
  instruction:
    "Per ognuna delle seguenti affermazioni, selezioni l’opzione che meglio descrive la frequenza del Suo comportamento quando era un/a bambino/a, di età compresa tra i 5 e i 12 anni.",
  questions,
};

// ===============================
// ✅ AGE-BASED NORMS CONFIG
// ===============================

type Esito =
  | "fortemente sintomatico"
  | "moderatamente sintomatico"
  | "lievemente sintomatico"
  | "";

type Stat = string; // allow "99°" + also ranges like "51-75°"

type RangeRow = { min: number; max: number; stat: Stat; esito: Esito };

type NormGroup = {
  disattenzione_punteggio: RangeRow[];
  iperattivita_impulsivita_punteggio: RangeRow[];
  totale_adhd_punteggio: RangeRow[];
  disattenzione_sintomi: RangeRow[];
  iperattivita_impulsivita_sintomi: RangeRow[];
  totale_adhd_sintomi: RangeRow[];
};

type AgeBandKey = "18-39" | "40-59" | "60-89";

const BAARS_CHILDHOOD_NORMS: Record<AgeBandKey, NormGroup> = {
  "18-39": {
    disattenzione_punteggio: [
      { min: 29, max: 36, stat: "99°", esito: "fortemente sintomatico" },
      { min: 26, max: 28, stat: "98°", esito: "moderatamente sintomatico" },
      { min: 25, max: 25, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 24, max: 24, stat: "96°", esito: "moderatamente sintomatico" },
      { min: 23, max: 23, stat: "95°", esito: "lievemente sintomatico" },
      { min: 22, max: 22, stat: "94°", esito: "lievemente sintomatico" },
      { min: 21, max: 21, stat: "92°", esito: "" },
      { min: 20, max: 20, stat: "91°", esito: "" },
      { min: 19, max: 19, stat: "89°", esito: "" },
      { min: 18, max: 18, stat: "86°", esito: "" },
      { min: 17, max: 17, stat: "78°", esito: "" },
      { min: 13, max: 16, stat: "51-75°", esito: "" },
      { min: 9, max: 12, stat: "1-50°", esito: "" },
    ],
    disattenzione_sintomi: [
      { min: 8, max: 9, stat: "99°", esito: "fortemente sintomatico" },
      { min: 7, max: 7, stat: "98°", esito: "moderatamente sintomatico" },
      { min: 6, max: 6, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 5, max: 5, stat: "96°", esito: "moderatamente sintomatico" },
      { min: 4, max: 4, stat: "95°", esito: "lievemente sintomatico" },
      { min: 0, max: 0, stat: "1-51°", esito: "" },
    ],

    iperattivita_impulsivita_punteggio: [
      { min: 29, max: 36, stat: "99°", esito: "fortemente sintomatico" },
      { min: 24, max: 26, stat: "98°", esito: "moderatamente sintomatico" },
      { min: 23, max: 23, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 22, max: 22, stat: "96°", esito: "moderatamente sintomatico" },
      { min: 21, max: 21, stat: "95°", esito: "lievemente sintomatico" },
      { min: 20, max: 20, stat: "94°", esito: "lievemente sintomatico" },
      { min: 17, max: 17, stat: "88°", esito: "" },
      { min: 16, max: 16, stat: "86°", esito: "" },
      { min: 15, max: 15, stat: "81°", esito: "" },
      { min: 14, max: 14, stat: "78°", esito: "" },
      { min: 11, max: 13, stat: "51-75°", esito: "" },
      { min: 9, max: 10, stat: "1-50°", esito: "" },
    ],

    iperattivita_impulsivita_sintomi: [
      { min: 7, max: 9, stat: "99°", esito: "fortemente sintomatico" },
      { min: 6, max: 6, stat: "98°", esito: "moderatamente sintomatico" },
      { min: 5, max: 5, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 4, max: 4, stat: "95°", esito: "lievemente sintomatico" },
      { min: 3, max: 3, stat: "93°", esito: "lievemente sintomatico" },
      { min: 2, max: 2, stat: "92°", esito: "" },
      { min: 1, max: 1, stat: "88°", esito: "" },
      { min: 0, max: 0, stat: "1-75°", esito: "" },
    ],

    totale_adhd_punteggio: [
      { min: 53, max: 72, stat: "99°", esito: "fortemente sintomatico" },
      { min: 46, max: 52, stat: "98°", esito: "moderatamente sintomatico" },
      { min: 44, max: 45, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 42, max: 43, stat: "96°", esito: "moderatamente sintomatico" },
      { min: 39, max: 41, stat: "95°", esito: "lievemente sintomatico" },
      { min: 38, max: 38, stat: "94°", esito: "lievemente sintomatico" },
      { min: 37, max: 37, stat: "92°", esito: "" },
      { min: 36, max: 36, stat: "90°", esito: "" },
      { min: 31, max: 31, stat: "80°", esito: "" },
      { min: 25, max: 30, stat: "51-75°", esito: "" },
      { min: 18, max: 24, stat: "1-75°", esito: "" },
    ],

    totale_adhd_sintomi: [
      { min: 13, max: 18, stat: "99°", esito: "fortemente sintomatico" },
      { min: 11, max: 12, stat: "98°", esito: "moderatamente sintomatico" },
      { min: 9, max: 10, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 8, max: 8, stat: "96°", esito: "moderatamente sintomatico" },
      { min: 7, max: 7, stat: "95°", esito: "lievemente sintomatico" },
      { min: 5, max: 5, stat: "91°", esito: "" },
      { min: 4, max: 4, stat: "89°", esito: "" },
      { min: 3, max: 3, stat: "85°", esito: "" },
      { min: 2, max: 2, stat: "83°", esito: "" },
      { min: 0, max: 0, stat: "1-75°", esito: "" },
    ],
  },

  // ✅ placeholders — fill later with real sheet values
  "40-59": {
    disattenzione_punteggio: [
      { min: 26, max: 36, stat: "99°", esito: "fortemente sintomatico" },
      { min: 23, max: 25, stat: "98°", esito: "moderatamente sintomatico" },
      { min: 22, max: 22, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 21, max: 21, stat: "95°", esito: "lievemente sintomatico" },
      { min: 20, max: 20, stat: "93°", esito: "lievemente sintomatico" },
      { min: 19, max: 19, stat: "92°", esito: "" },
      { min: 18, max: 18, stat: "89°", esito: "" },
      { min: 17, max: 17, stat: "84°", esito: "" },
      { min: 16, max: 16, stat: "78°", esito: "" },
      { min: 13, max: 14, stat: "51-75°", esito: "" },
      { min: 9, max: 12, stat: "1-50°", esito: "" },
    ],

    disattenzione_sintomi: [
      { min: 8, max: 9, stat: "99°", esito: "fortemente sintomatico" },
      { min: 7, max: 7, stat: "98°", esito: "moderatamente sintomatico" },
      { min: 6, max: 6, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 5, max: 5, stat: "96°", esito: "moderatamente sintomatico" },
      { min: 4, max: 4, stat: "95°", esito: "lievemente sintomatico" },
      { min: 0, max: 0, stat: "1-51°", esito: "" },
    ],

    iperattivita_impulsivita_punteggio: [
      { min: 25, max: 36, stat: "99°", esito: "fortemente sintomatico" },
      { min: 22, max: 24, stat: "98°", esito: "moderatamente sintomatico" },
      { min: 20, max: 21, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 18, max: 19, stat: "96°", esito: "moderatamente sintomatico" },
      { min: 17, max: 17, stat: "93°", esito: "lievemente sintomatico" },
      { min: 16, max: 16, stat: "91°", esito: "" },
      { min: 15, max: 15, stat: "88°", esito: "" },
      { min: 14, max: 14, stat: "87°", esito: "" },
      { min: 13, max: 13, stat: "76°", esito: "" },
      { min: 11, max: 12, stat: "51-75°", esito: "" },
      { min: 9, max: 10, stat: "1-50°", esito: "" },
    ],

    iperattivita_impulsivita_sintomi: [
      { min: 7, max: 9, stat: "99°", esito: "fortemente sintomatico" },
      { min: 6, max: 6, stat: "98°", esito: "moderatamente sintomatico" },
      { min: 5, max: 5, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 4, max: 4, stat: "95°", esito: "lievemente sintomatico" },
      { min: 3, max: 3, stat: "93°", esito: "lievemente sintomatico" },
      { min: 2, max: 2, stat: "92°", esito: "" },
      { min: 1, max: 1, stat: "88°", esito: "" },
      { min: 0, max: 0, stat: "1-75°", esito: "" },
    ],

    totale_adhd_punteggio: [
      { min: 50, max: 72, stat: "99°", esito: "fortemente sintomatico" },
      { min: 45, max: 49, stat: "98°", esito: "moderatamente sintomatico" },
      { min: 40, max: 44, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 37, max: 39, stat: "96°", esito: "moderatamente sintomatico" },
      { min: 36, max: 36, stat: "95°", esito: "lievemente sintomatico" },
      { min: 35, max: 35, stat: "94°", esito: "lievemente sintomatico" },
      { min: 34, max: 34, stat: "92°", esito: "" },
      { min: 33, max: 33, stat: "90°", esito: "" },
      { min: 32, max: 32, stat: "88°", esito: "" },
      { min: 31, max: 31, stat: "88°", esito: "" },
      { min: 30, max: 30, stat: "82°", esito: "" },
      { min: 29, max: 29, stat: "81°", esito: "" },
      { min: 28, max: 28, stat: "76°", esito: "" },
      { min: 24, max: 27, stat: "51-75°", esito: "" },
      { min: 18, max: 23, stat: "1-50°", esito: "" },
    ],

    totale_adhd_sintomi: [
      { min: 13, max: 18, stat: "99°", esito: "fortemente sintomatico" },
      { min: 11, max: 12, stat: "98°", esito: "moderatamente sintomatico" },
      { min: 9, max: 10, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 8, max: 8, stat: "96°", esito: "moderatamente sintomatico" },
      { min: 7, max: 7, stat: "95°", esito: "lievemente sintomatico" },
      { min: 5, max: 5, stat: "91°", esito: "" },
      { min: 4, max: 4, stat: "89°", esito: "" },
      { min: 3, max: 3, stat: "85°", esito: "" },
      { min: 2, max: 2, stat: "83°", esito: "" },
      { min: 0, max: 0, stat: "1-75°", esito: "" },
    ]
  },
  "60-89": {
    disattenzione_punteggio: [
      { min: 22, max: 36, stat: "99°", esito: "fortemente sintomatico" },
      { min: 19, max: 21, stat: "98°", esito: "moderatamente sintomatico" },
      { min: 18, max: 18, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 17, max: 17, stat: "89°", esito: "" },
      { min: 16, max: 16, stat: "82°", esito: "" },
      { min: 15, max: 15, stat: "77°", esito: "" },
      { min: 12, max: 14, stat: "51-75°", esito: "" },
      { min: 9, max: 11, stat: "1-50°", esito: "" },
    ],
       disattenzione_sintomi: [
      { min: 8, max: 9, stat: "99°", esito: "fortemente sintomatico" },
      { min: 7, max: 7, stat: "98°", esito: "moderatamente sintomatico" },
      { min: 6, max: 6, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 5, max: 5, stat: "96°", esito: "moderatamente sintomatico" },
      { min: 4, max: 4, stat: "95°", esito: "lievemente sintomatico" },
      { min: 0, max: 0, stat: "1-51°", esito: "" },
    ],
    iperattivita_impulsivita_punteggio: [
      { min: 19, max: 36, stat: "99°", esito: "fortemente sintomatico" },
      { min: 18, max: 18, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 17, max: 17, stat: "94°", esito: "lievemente sintomatico" },
      { min: 16, max: 16, stat: "91°", esito: "" },
      { min: 15, max: 15, stat: "88°", esito: "" },
      { min: 14, max: 14, stat: "82°", esito: "" },
      { min: 13, max: 13, stat: "77°", esito: "" },
      { min: 10, max: 12, stat: "51-75°", esito: "" },
      { min: 9, max: 9, stat: "1-50°", esito: "" },
    ],
      iperattivita_impulsivita_sintomi: [
     { min: 7, max: 9, stat: "99°", esito: "fortemente sintomatico" },
      { min: 6, max: 6, stat: "98°", esito: "moderatamente sintomatico" },
      { min: 5, max: 5, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 4, max: 4, stat: "95°", esito: "lievemente sintomatico" },
      { min: 3, max: 3, stat: "93°", esito: "lievemente sintomatico" },
      { min: 2, max: 2, stat: "92°", esito: "" },
      { min: 1, max: 1, stat: "88°", esito: "" },
      { min: 0, max: 0, stat: "1-75°", esito: "" },
  ],
    totale_adhd_punteggio: [
      { min: 41, max: 72, stat: "99°", esito: "fortemente sintomatico" },
      { min: 37, max: 40, stat: "98°", esito: "moderatamente sintomatico" },
      { min: 36, max: 36, stat: "97°", esito: "moderatamente sintomatico" },
      { min: 35, max: 35, stat: "96°", esito: "moderatamente sintomatico" },
      { min: 34, max: 34, stat: "95°", esito: "lievemente sintomatico" },
      { min: 33, max: 33, stat: "94°", esito: "lievemente sintomatico" },
      { min: 32, max: 32, stat: "92°", esito: "" },
      { min: 31, max: 31, stat: "88°", esito: "" },
      { min: 30, max: 30, stat: "84°", esito: "" },
      { min: 29, max: 29, stat: "83°", esito: "" },
      { min: 28, max: 28, stat: "82°", esito: "" },
      { min: 27, max: 27, stat: "77°", esito: "" },
      { min: 23, max: 26, stat: "51-75°", esito: "" },
      { min: 18, max: 22, stat: "1-50°", esito: "" },
    ],
    totale_adhd_sintomi: [
    { min: 13, max: 18, stat: "99°", esito: "fortemente sintomatico" },
    { min: 11, max: 12, stat: "98°", esito: "moderatamente sintomatico" },
    { min: 9, max: 10, stat: "97°", esito: "moderatamente sintomatico" },
    { min: 8, max: 8, stat: "96°", esito: "moderatamente sintomatico" },
    { min: 7, max: 7, stat: "95°", esito: "lievemente sintomatico" },
    { min: 5, max: 5, stat: "91°", esito: "" },
    { min: 4, max: 4, stat: "89°", esito: "" },
    { min: 3, max: 3, stat: "85°", esito: "" },
    { min: 2, max: 2, stat: "83°", esito: "" },
    { min: 0, max: 0, stat: "1-75°", esito: "" },
    ]
  },
};

// ===============================
// ✅ HELPERS
// ===============================

function pickAgeBand(age: number): AgeBandKey {
  if (age >= 18 && age <= 39) return "18-39";
  if (age >= 40 && age <= 59) return "40-59";
  return "60-89";
}

function classify(score: number, rows: RangeRow[]): { stat: Stat; esito: Esito } {
  for (const r of rows) {
    if (score >= r.min && score <= r.max) return { stat: r.stat, esito: r.esito };
  }
  return { stat: "", esito: "" };
}

/**
 * UI sometimes sends:
 * - "Mai o raramente__0"
 * - "1__0"
 * - { label: "Mai o raramente" }
 * - { value: 1 } / { id: 1 }
 * - 1
 */
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

function envToString(envRaw: any): string {
  if (!Array.isArray(envRaw)) return "";
  return envRaw
    .map((x) => {
      if (x == null) return "";
      if (typeof x === "string" || typeof x === "number") return String(stripUiSuffix(x));
      if (typeof x === "object") {
        const lab = (x as any).label ?? (x as any).value ?? (x as any).id ?? "";
        return String(stripUiSuffix(lab));
      }
      return "";
    })
    .filter(Boolean)
    .join(", ");
}

// ===============================
// ✅ COMPUTE (with age + STAT/ESITO)
// ===============================

export type ComputeCtx = { patientAge?: number | null };

export function computeBAARSIVChildhoodSelf(answers: Record<string, any>, ctx?: ComputeCtx) {
  const inatt: number[] = [];
  const hyper: number[] = [];

  for (let i = 1; i <= 9; i++) inatt.push(toScore(answers[qKey(i)]));
  for (let i = 10; i <= 18; i++) hyper.push(toScore(answers[qKey(i)]));
  
  const inattScore = inatt.reduce((a, b) => a + b, 0);
  const inattSymptoms = inatt.filter((v) => v >= 3).length;

  const hyperScore = hyper.reduce((a, b) => a + b, 0);
  const hyperSymptoms = hyper.filter((v) => v >= 3).length;

  const totalScoreComputed = inattScore + hyperScore;
  const totalSymptomsComputed = inattSymptoms + hyperSymptoms;

  const age = Number(ctx?.patientAge ?? 0);
  const band = pickAgeBand(age);
  const norms = BAARS_CHILDHOOD_NORMS[band];

  const disaPunteggio = classify(inattScore, norms.disattenzione_punteggio);
  const impuPunteggio = classify(hyperScore, norms.iperattivita_impulsivita_punteggio);
  const totalPunteggio = classify(totalScoreComputed, norms.totale_adhd_punteggio);
  
  const disaSintomi = classify(inattSymptoms, norms.disattenzione_sintomi);
  const impuSintomi = classify(hyperSymptoms, norms.iperattivita_impulsivita_sintomi);
  const totalSintomi = classify(totalSymptomsComputed, norms.totale_adhd_sintomi);

  const env = envToString(answers[qKey(19)]);

  return {
    "Disattenzione punteggio PG": String(inattScore),
    "Disattenzione punteggio STAT": disaPunteggio.stat,
    "Disattenzione punteggio ESITO": disaPunteggio.esito,

    "Disattenzione n° sintomi PG": String(inattSymptoms),
    "Disattenzione n° sintomi STAT": disaSintomi.stat,
    "Disattenzione n° sintomi ESITO": disaSintomi.esito,

    "Iperattività/Impulsività punteggio PG": String(hyperScore),
    "Iperattività/Impulsività punteggio STAT": impuPunteggio.stat,
    "Iperattività/Impulsività punteggio ESITO": impuPunteggio.esito,

    "Iperattività/Impulsività n° sintomi PG": String(hyperSymptoms),
    "Iperattività/Impulsività n° sintomi STAT": impuSintomi.stat,
    "Iperattività/Impulsività n° sintomi ESITO": impuSintomi.esito,

    // For ADHD total score, returning 0 for now (you can adjust this later with the actual calculation)
    "Totale ADHD punteggio PG": String(totalScoreComputed),  // If you have a calculation for this, update it
    "Totale ADHD punteggio STAT": totalPunteggio.stat,
    "Totale ADHD punteggio ESITO": totalPunteggio.esito,

    "Totale ADHD n° sintomi PG": String(totalSymptomsComputed),  // Same for symptoms, replace 0 if needed
    "Totale ADHD n° sintomi STAT": totalSintomi.stat,
    "Totale ADHD n° sintomi ESITO": totalSintomi.esito,

    // Debug info (optional)
    // "Totale ADHDpunteggio PG": String(totalScoreComputed),
    // "Totale ADHD n°sintomi PG": String(totalSymptomsComputed),

    "Ambienti con difficoltà MULTI": env,
    "Norms age band": band,
  };
}
