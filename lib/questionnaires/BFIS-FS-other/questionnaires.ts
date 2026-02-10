import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS = [
  { label: "0", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "NA", value: "NA" },
] as const;

const QUESTIONS_1_15: string[] = [
  "Nella vita a casa con i suoi parenti stretti",
  "Nel portare a termine i doveri di casa e nel mandare avanti la sua famiglia",
  "Nel suo lavoro o occupazione",
  "Nelle sue interazioni sociali con gli estranei e con i conoscenti",
  "Nei suoi rapporti con gli amici",
  "Nelle sue attività di comunità (chiesa, associazioni, gruppi sociali organizzazioni)",
  "In tutte le attività educative (università, corsi serali, formazione tecnica, formazione professionale)",
  "Nel suo rapporto coniugale, convivenza, o nelle sue relazioni sentimentali",
  "Nella gestione del denaro, dei suoi conti, dei suoi debiti",
  "Nella guida dell'automobile e nei suoi precedenti di multe e incidenti",
  "Nella sua attività sessuale e nelle relazioni sessuali con altre persone",
  "Nella organizzazione e gestione delle sue responsabilità quotidiane",
  "Nel prendersi cura di se stesso/a quotidianamente (abbigliamento, pulizia e igiene personale, alimentazione, sonno, ecc.)",
  "Nel mantenimento della sua salute (esercizio fisico, alimentazione, controlli medici, cure dei denti, ecc.)",
  "Nel prendersi cura dei suoi figli e della loro educazione",
];

const questions: Question[] = QUESTIONS_1_15.map(
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

export const BFISFL_OTHER: QuestionnaireDef = {
  code: "BFISFL_OTHER",
  formCode: "BFISFL_OTHER",
  type: "OTHER",
  name: "BFISFL_OTHER",
  instruction:
    'Potrebbe cortesemente descrivere il comportamento di questa persona che conosce bene, riportando quanta difficoltà nel funzionare efficientemente* in ognuna di queste principali attività di vita? Ovvero, in che grado è compromessa in ciascuno di questi domini di vita? Selezioni per favore il numero (dove 0 sta a "per niente" e 9 sta a "gravemente") che meglio descrive le difficoltà di funzionamento della persona in valutazione NEGLI ULTIMI 6 MESI. Se la situazione descritta non risulta applicabile a questa persona (per esempio non guida l\'auto, non ha figli, vive da solo/a, ecc.) per favore selezioni NA ("non applicabile").\n\n*Con funzionare efficientemente si intende il fare le cose richieste, che la persona dovrebbe fare e/o che era in grado di fare quando si sentiva bene.',
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito =
  | "fortemente sintomatico"
  | "moderatamente sintomatico"
  | "lievemente sintomatico"
  | "";

function stripUiSuffix(v: unknown) {
  if (typeof v !== "string") return v;
  return v.split("__")[0].trim();
}

function toScore(ans: any): number | "NA" {
  if (ans == null) return "NA";

  // Handle "NA" responses
  if (String(ans).toUpperCase() === "NA") return "NA";

  let rawScore: number | "NA" = 0;

  if (typeof ans === "number") {
    rawScore = Number.isFinite(ans) ? ans : 0;
  } else if (typeof ans === "string") {
    const s0 = String(stripUiSuffix(ans)).toUpperCase();
    if (s0 === "NA") return "NA";
    const n = Number(s0);
    if (!Number.isNaN(n) && Number.isFinite(n)) {
      rawScore = n;
    } else {
      rawScore = scoreFromLabel(s0);
    }
  } else if (typeof ans === "object") {
    const val = (ans as any).value ?? (ans as any).id ?? null;
    if (val != null) {
      const v0 = String(stripUiSuffix(val)).toUpperCase();
      if (v0 === "NA") return "NA";
      const n = Number(v0);
      if (!Number.isNaN(n) && Number.isFinite(n)) {
        rawScore = n;
      }
    }
    const lab = (ans as any).label ?? null;
    if (lab != null) {
      const labStr = String(stripUiSuffix(lab)).toUpperCase();
      if (labStr === "NA") return "NA";
      if (rawScore === 0) {
        rawScore = scoreFromLabel(labStr);
      }
    }
  }

  return rawScore;
}

// ===============================
// AGE-BASED NORMS
// ===============================

type AgeGroup = "18-39" | "40-59" | "60-89";

type RangeRow = {
  min: number;
  max: number | null;
  stat: string;
  esito: Esito;
};

type PercentageRow = {
  min: number;
  max: number | null;
  stat: string;
  esito: Esito;
};

const NORMS_COMPROMISSIONE: Record<AgeGroup, RangeRow[]> = {
  "18-39": [
    { min: 5.8, max: null, stat: "99°", esito: "fortemente sintomatico" },
    { min: 5.2, max: 5.7, stat: "98°", esito: "moderatamente sintomatico" },
    { min: 5.0, max: 5.1, stat: "97°", esito: "moderatamente sintomatico" },
    { min: 4.7, max: 4.9, stat: "96°", esito: "moderatamente sintomatico" },
    { min: 4.4, max: 4.6, stat: "95°", esito: "lievemente sintomatico" },
    { min: 4.1, max: 4.3, stat: "94°", esito: "lievemente sintomatico" },
    { min: 4.0, max: 4.0, stat: "93°", esito: "lievemente sintomatico" },
    { min: 3.9, max: 3.9, stat: "92°", esito: "" },
    { min: 3.8, max: 3.8, stat: "91°", esito: "" },
    { min: 3.7, max: 3.7, stat: "90°", esito: "" },
    { min: 3.6, max: 3.6, stat: "89°", esito: "" },
    { min: 3.5, max: 3.5, stat: "88°", esito: "" },
    { min: 3.4, max: 3.4, stat: "87°", esito: "" },
    { min: 3.3, max: 3.3, stat: "86°", esito: "" },
    { min: 3.1, max: 3.2, stat: "85°", esito: "" },
    { min: 2.2, max: 3.0, stat: "76-84°", esito: "" },
    { min: 0.8, max: 2.1, stat: "51–75°", esito: "" },
    { min: 0, max: 0.7, stat: "1–50°", esito: "" },
  ],
  "40-59": [
    { min: 5.2, max: null, stat: "99°", esito: "fortemente sintomatico" },
    { min: 4.5, max: 5.1, stat: "98°", esito: "moderatamente sintomatico" },
    { min: 4.3, max: 4.4, stat: "97°", esito: "moderatamente sintomatico" },
    { min: 3.5, max: 4.2, stat: "96°", esito: "moderatamente sintomatico" },
    { min: 3.3, max: 3.4, stat: "95°", esito: "lievemente sintomatico" },
    { min: 3.2, max: 3.2, stat: "94°", esito: "lievemente sintomatico" },
    { min: 2.9, max: 3.1, stat: "93°", esito: "lievemente sintomatico" },
    { min: 2.7, max: 2.8, stat: "92°", esito: "" },
    { min: 2.5, max: 2.6, stat: "91°", esito: "" },
    { min: 2.4, max: 2.4, stat: "90°", esito: "" },
    { min: 2.3, max: 2.3, stat: "89°", esito: "" },
    { min: 2.2, max: 2.2, stat: "88°", esito: "" },
    { min: 2.1, max: 2.1, stat: "87°", esito: "" },
    { min: 2.0, max: 2.0, stat: "86°", esito: "" },
    { min: 1.9, max: 1.9, stat: "85°", esito: "" },
    { min: 1.4, max: 1.8, stat: "76-84°", esito: "" },
    { min: 0.6, max: 1.3, stat: "51–75°", esito: "" },
    { min: 0, max: 0.5, stat: "1–50°", esito: "" },
  ],
  "60-89": [
    { min: 5.7, max: null, stat: "99°", esito: "fortemente sintomatico" },
    { min: 5.3, max: 5.6, stat: "98°", esito: "moderatamente sintomatico" },
    { min: 4.8, max: 5.2, stat: "97°", esito: "moderatamente sintomatico" },
    { min: 4.4, max: 4.7, stat: "96°", esito: "moderatamente sintomatico" },
    { min: 4.1, max: 4.3, stat: "95°", esito: "lievemente sintomatico" },
    { min: 3.8, max: 4.0, stat: "94°", esito: "lievemente sintomatico" },
    { min: 3.5, max: 3.7, stat: "93°", esito: "lievemente sintomatico" },
    { min: 3.4, max: 3.4, stat: "92°", esito: "" },
    { min: 3.3, max: 3.3, stat: "91°", esito: "" },
    { min: 3.2, max: 3.2, stat: "90°", esito: "" },
    { min: 3.0, max: 3.1, stat: "89°", esito: "" },
    { min: 2.9, max: 2.9, stat: "88°", esito: "" },
    { min: 2.8, max: 2.8, stat: "87°", esito: "" },
    { min: 2.7, max: 2.7, stat: "86°", esito: "" },
    { min: 2.6, max: 2.6, stat: "85°", esito: "" },
    { min: 2.1, max: 2.5, stat: "76-84°", esito: "" },
    { min: 0.9, max: 2.0, stat: "51–75°", esito: "" },
    { min: 0, max: 0.8, stat: "1–50°", esito: "" },
  ],
};

const NORMS_PERCENTUALE: Record<AgeGroup, PercentageRow[]> = {
  "18-39": [
    { min: 93, max: null, stat: "99°", esito: "fortemente sintomatico" },
    { min: 73, max: 93, stat: "98°", esito: "moderatamente sintomatico" },
    { min: 65, max: 72, stat: "97°", esito: "moderatamente sintomatico" },
    { min: 63, max: 64, stat: "96°", esito: "moderatamente sintomatico" },
    { min: 57, max: 62, stat: "95°", esito: "lievemente sintomatico" },
    { min: 50, max: 56, stat: "94°", esito: "lievemente sintomatico" },
    { min: 46, max: 49, stat: "93°", esito: "lievemente sintomatico" },
    { min: 45, max: 45, stat: "92°", esito: "lievemente sintomatico" },
    { min: 42, max: 44, stat: "91°", esito: "" },
    { min: 39, max: 41, stat: "90°", esito: "" },
    { min: 37, max: 38, stat: "89°", esito: "" },
    { min: 33, max: 36, stat: "88°", esito: "" },
    { min: 32, max: 32, stat: "87°", esito: "" },
    { min: 31, max: 31, stat: "86°", esito: "" },
    { min: 30, max: 30, stat: "85°", esito: "" },
    { min: 14, max: 29, stat: "76-84°", esito: "" },
    { min: 1, max: 13, stat: "51–75°", esito: "" },
    { min: 0, max: 0, stat: "1–50°", esito: "" },
  ],
  "40-59": [
    { min: 91, max: null, stat: "99°", esito: "fortemente sintomatico" },
    { min: 65, max: 91, stat: "98°", esito: "moderatamente sintomatico" },
    { min: 60, max: 64, stat: "97°", esito: "moderatamente sintomatico" },
    { min: 53, max: 59, stat: "96°", esito: "moderatamente sintomatico" },
    { min: 46, max: 52, stat: "95°", esito: "lievemente sintomatico" },
    { min: 40, max: 45, stat: "94°", esito: "lievemente sintomatico" },
    { min: 26, max: 39, stat: "93°", esito: "lievemente sintomatico" },
    { min: 21, max: 25, stat: "92°", esito: "lievemente sintomatico" },
    { min: 19, max: 20, stat: "91°", esito: "" },
    { min: 16, max: 18, stat: "90°", esito: "" },
    { min: 13, max: 15, stat: "89°", esito: "" },
    { min: 12, max: 12, stat: "88°", esito: "" },
    { min: 11, max: 11, stat: "87°", esito: "" },
    { min: 10, max: 10, stat: "86°", esito: "" },
    { min: 8, max: 9, stat: "85°", esito: "" },
    { min: 6, max: 7, stat: "76-84°", esito: "" },
    { min: 1, max: 5, stat: "51–75°", esito: "" },
    { min: 0, max: 0, stat: "1–50°", esito: "" },
  ],
  "60-89": [
    { min: 87, max: null, stat: "99°", esito: "fortemente sintomatico" },
    { min: 69, max: 87, stat: "98°", esito: "moderatamente sintomatico" },
    { min: 58, max: 68, stat: "97°", esito: "moderatamente sintomatico" },
    { min: 53, max: 57, stat: "96°", esito: "moderatamente sintomatico" },
    { min: 46, max: 52, stat: "95°", esito: "lievemente sintomatico" },
    { min: 40, max: 45, stat: "94°", esito: "lievemente sintomatico" },
    { min: 32, max: 39, stat: "93°", esito: "lievemente sintomatico" },
    { min: 27, max: 31, stat: "92°", esito: "" },
    { min: 23, max: 26, stat: "91°", esito: "" },
    { min: 21, max: 22, stat: "90°", esito: "" },
    { min: 19, max: 20, stat: "89°", esito: "" },
    { min: 18, max: 18, stat: "88°", esito: "" },
    { min: 17, max: 17, stat: "87°", esito: "" },
    { min: 16, max: 16, stat: "86°", esito: "" },
    { min: 15, max: 15, stat: "85°", esito: "" },
    { min: 8, max: 14, stat: "76-84°", esito: "" },
    { min: 1, max: 7, stat: "51–75°", esito: "" },
    { min: 0, max: 0, stat: "1–50°", esito: "" },
  ],
};

function getAgeGroup(age: number | null | undefined): AgeGroup {
  if (age == null) return "18-39"; // default
  if (age >= 18 && age <= 39) return "18-39";
  if (age >= 40 && age <= 59) return "40-59";
  if (age >= 60 && age <= 89) return "60-89";
  // fallback for ages outside range
  if (age < 18) return "18-39";
  if (age > 89) return "60-89";
  return "18-39";
}

function classify(
  value: number,
  rows: RangeRow[] | PercentageRow[],
): { stat: string; esito: Esito } {
  for (const r of rows) {
    if (r.max === null) {
      if (value >= r.min) return { stat: r.stat, esito: r.esito };
    } else {
      if (value >= r.min && value <= r.max)
        return { stat: r.stat, esito: r.esito };
    }
  }
  return { stat: "", esito: "" };
}

// ===============================
// COMPUTE
// ===============================

export type ComputeCtx = {
  patientAge?: number | null;
  patientGender?: string | null; // ✅ Add this (even if not used)
};
export function computeBFISFLOther(
  answers: Record<string, any>,
  ctx?: ComputeCtx,
) {
  const scores: (number | "NA")[] = [];
  for (let i = 1; i <= 15; i++) {
    scores.push(toScore(answers[qKey(i)]));
  }

  // Filter out NA responses
  const validScores = scores.filter((s) => s !== "NA") as number[];
  const totalResponses = validScores.length;

  if (totalResponses === 0) {
    return {
      "Punteggio medio di compromissione (other) PG": "0.00",
      "Punteggio medio di compromissione (other) STAT": "",
      "Punteggio medio di compromissione (other) ESITO": "",

      "Percentuale di domini compromessi (other) PG": "0",
      "Percentuale di domini compromessi (other) STAT": "",
      "Percentuale di domini compromessi (other) ESITO": "",

      "Age group used": "",
    };
  }

  // Punteggio medio: average of valid responses
  const sumScores = validScores.reduce((a, b) => a + b, 0);
  const avgScore = sumScores / totalResponses;

  // Percentuale: count of responses >= 5 divided by total valid responses * 100
  const countCompromised = validScores.filter((s) => s >= 5).length;
  const percentageCompromised = (countCompromised / totalResponses) * 100;

  const ageGroup = getAgeGroup(ctx?.patientAge);

  const compromissioneResult = classify(
    avgScore,
    NORMS_COMPROMISSIONE[ageGroup],
  );

  // Round percentage before classification
  const roundedPercentage = Math.round(percentageCompromised);

  const percentualeResult = classify(
    roundedPercentage,
    NORMS_PERCENTUALE[ageGroup],
  );

  return {
    "Punteggio medio di compromissione (other) PG": avgScore.toFixed(2),
    "Punteggio medio di compromissione (other) STAT": compromissioneResult.stat,
    "Punteggio medio di compromissione (other) ESITO":
      compromissioneResult.esito,

    "Percentuale di domini compromessi (other) PG":
      roundedPercentage.toString(),
    "Percentuale di domini compromessi (other) STAT": percentualeResult.stat,
    "Percentuale di domini compromessi (other) ESITO": percentualeResult.esito,

    "Age group used": ageGroup,
  };
}
