import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS_1_4 = [
  { label: "Mai o raramente", value: 1 },
  { label: "Talvolta", value: 2 },
  { label: "Spesso", value: 3 },
  { label: "Molto Spesso", value: 4 },
] as const;

const QUESTIONS_1_18: string[] = [
  "Non presta sufficiente attenzione ai dettagli o commette errori di distrazione nei compiti scolastici, sul lavoro o in altre attività.",
  "Ha difficoltà a mantenere l’attenzione nei compiti o nelle attività di gioco (ad esempio ha difficoltà a rimanere concentrato durante le conversazioni o nella lettura prolungata)",
  "Sembra non ascoltare quando gli si parla direttamente",
  "Non segue le istruzioni e non porta a termine i compiti scolastici, le faccende domestiche o i doveri sul posto di lavoro",
  "Ha difficoltà nell’organizzare compiti e attività",
  "Evita, non gradisce o è riluttante a impegnarsi in compiti che richiedono uno sforzo mentale prolungato (ad esempio compiti scolastici o doveri casalinghi)",
  "Perde oggetti necessari per i compiti o le attività (ad esempio materiale scolastico, matite, libri, strumenti, portafogli, chiavi, documenti, occhiali, telefono cellulare)",
  "Si distrae facilmente",
  "È smemorato nelle attività quotidiane (ad esempio svolgere le faccende domestiche, fare commissioni, restituire chiamate, rispettare appuntamenti)",

  "Si agita, tamburella con mani o piedi o si dimena sulla sedia",
  "Si alza dal posto in situazioni in cui ci si aspetta che rimanga seduto",
  "Corre o si arrampica in situazioni in cui è inappropriato, oppure appare irrequieto",
  "Non riesce a giocare o a impegnarsi in attività ricreative in modo tranquillo (ad esempio è incapace o a disagio nel rimanere fermo per periodi prolungati)",
  "È “sempre in movimento”, agisce come se fosse “spinto da un motore”",
  "Parla eccessivamente.",
  "Risponde precipitosamente prima che la domanda sia stata completata.",
  "Ha difficoltà ad attendere il proprio turno (ad esempio mentre è in fila)",
  "Interrompe o si intromette (ad esempio si inserisce nelle conversazioni, nei giochi o nelle attività, può interferire o prendere il controllo di ciò che gli altri stanno facendo)",
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
questions.push({
  key: "instruction_part2",
  number: null as any, // type override
  text: "In che entità i comportamenti a cui ha risposto precedentemente causano problemi a suo/a figlio/a nei seguenti ambiti:",
  type: "instruction" as any, // type override
  required: false,
  options: [],
} as any);

// Part 2 questions (19-24) - Impairment ratings
const IMPAIRMENT_OPTIONS = [
  { label: "Nessun problema", value: 0 },
  { label: "Problema lieve", value: 1 },
  { label: "Problema moderato", value: 2 },
  { label: "Problema grave", value: 3 },
] as const;

const IMPAIRMENT_QUESTIONS = [
  "Relazioni con i familiari",
  "Relazioni con gli altri adolescenti",
  "Completamento o restituzione dei compiti",
  "Rendimento scolastico",
  "Controllo del comportamento a scuola",
  "Sentirsi bene con se stesso/a",
];

IMPAIRMENT_QUESTIONS.forEach((text, i) => {
  questions.push({
    key: `q${19 + i}`,
    number: 19 + i,
    text,
    type: "single_choice",
    required: true,
    options: [...IMPAIRMENT_OPTIONS],
  });
});

export const ADHD_RS5_GENITORE_OTHER: QuestionnaireDef = {
  code: "ADHD_RS5_GENITORE_OTHER",
  formCode: "ADHD_RS5_GENITORE_OTHER",
  type: "OTHER",
  name: "ADHD_RS5_GENITORE_OTHER",
  instruction:
    "Si prega di selezionare la risposta che descrive meglio il comportamento di suo/a figlio/a negli ultimi 6 mesi, ovvero con quale frequenza suo/a figlio/a manifesta un determinato comportamento?",
  questions,
};

// ===============================
// GENDER-BASED NORMS CONFIG
// ===============================

type Esito =
  | "fortemente sintomatico"
  | "moderatamente sintomatico"
  | "lievemente sintomatico"
  | "";

type Stat = string; // allow ">99°", "99°", ranges like "94-95°"

type RangeRow = { min: number; max: number; stat: Stat; esito: Esito };

type NormGroup = {
  disattenzione: RangeRow[];
  iperattivita_impulsivita: RangeRow[];
  totale: RangeRow[];
};

type ImpairmentNorm = {
  stat: Record<number, string>; // PG score -> STAT
  esito: Record<number, Esito>; // PG score -> ESITO
};

type ImpairmentNorms = {
  relazioni_familiari: ImpairmentNorm;
  relazioni_pari: ImpairmentNorm;
  compiti_scolastici: ImpairmentNorm;
  rendimento_scolastico: ImpairmentNorm;
  comportamento: ImpairmentNorm;
  autostima: ImpairmentNorm;
};

type GenderKey = "MALE" | "FEMALE";

// ===============================
// ✅ MALE NORMS
// ===============================

const MALE_NORMS: NormGroup = {
  disattenzione: [
    { min: 27, max: 27, stat: ">99°", esito: "fortemente sintomatico" },
    { min: 26, max: 26, stat: "99°", esito: "fortemente sintomatico" },
    { min: 25, max: 25, stat: "98°", esito: "moderatamente sintomatico" },
    { min: 21, max: 44, stat: "97°", esito: "moderatamente sintomatico" },
    { min: 20, max: 20, stat: "96°", esito: "moderatamente sintomatico" },
    { min: 19, max: 19, stat: "95°", esito: "lievemente sintomatico" },
    { min: 18, max: 18, stat: "93°-94°", esito: "lievemente sintomatico" },
    { min: 17, max: 17, stat: "92°", esito: "" },
    { min: 16, max: 16, stat: "90°-91°", esito: "" },
    { min: 15, max: 15, stat: "89°", esito: "" },
    { min: 14, max: 14, stat: "88°", esito: "" },
    { min: 13, max: 13, stat: "87°", esito: "" },
    { min: 12, max: 12, stat: "86°", esito: "" },
    { min: 11, max: 11, stat: "84°-85°", esito: "" },
    { min: 10, max: 10, stat: "80°", esito: "" },
    { min: 9, max: 9, stat: "75°", esito: "" },
    { min: 4, max: 8, stat: "50°", esito: "" },
    { min: 1, max: 3, stat: "25°", esito: "" },
    { min: 0, max: 0, stat: "1°-10°", esito: "" },
  ],

  iperattivita_impulsivita: [
    { min: 21, max: 27, stat: ">99°", esito: "fortemente sintomatico" },
    { min: 16, max: 20, stat: "99°", esito: "fortemente sintomatico" },
    { min: 15, max: 15, stat: "98°", esito: "moderatamente sintomatico" },
    { min: 13, max: 14, stat: "97°", esito: "moderatamente sintomatico" },
    { min: 12, max: 12, stat: "96°", esito: "moderatamente sintomatico" },
    { min: 10, max: 11, stat: "95°", esito: "lievemente sintomatico" },
    { min: 9, max: 9, stat: "93°-94°", esito: "lievemente sintomatico" },
    { min: 8, max: 8, stat: "90°-92°", esito: "" },
    { min: 7, max: 7, stat: "88°-89°", esito: "" },
    { min: 6, max: 6, stat: "87°", esito: "" },
    { min: 5, max: 5, stat: "84°-86°", esito: "" },
    { min: 4, max: 4, stat: "80°", esito: "" },
    { min: 3, max: 3, stat: "75°", esito: "" },
    { min: 1, max: 2, stat: "50°", esito: "" },
    { min: 0, max: 0, stat: "1°-25°", esito: "" },
  ],

  totale: [
    { min: 47, max: 54, stat: ">99°", esito: "fortemente sintomatico" },
    { min: 39, max: 46, stat: "99°", esito: "fortemente sintomatico" },
    { min: 37, max: 38, stat: "98°", esito: "moderatamente sintomatico" },
    { min: 34, max: 36, stat: "97°", esito: "moderatamente sintomatico" },
    { min: 30, max: 33, stat: "96°", esito: "moderatamente sintomatico" },
    { min: 27, max: 29, stat: "95°", esito: "lievemente sintomatico" },
    { min: 26, max: 26, stat: "94°", esito: "lievemente sintomatico" },
    { min: 25, max: 25, stat: "93°", esito: "lievemente sintomatico" },
    { min: 25, max: 25, stat: "92°", esito: "" }, //NEED TO CHECK
    { min: 22, max: 24, stat: "91°", esito: "" },
    { min: 21, max: 21, stat: "90°", esito: "" },
    { min: 20, max: 20, stat: "89°", esito: "" },
    { min: 19, max: 19, stat: "88°", esito: "" },
    { min: 18, max: 18, stat: "87°", esito: "" },
    { min: 18, max: 18, stat: "86°", esito: "" },
    { min: 17, max: 17, stat: "85°", esito: "" },
    { min: 16, max: 16, stat: "84°", esito: "" },
    { min: 14, max: 15, stat: "80°", esito: "" },
    { min: 11, max: 13, stat: "75°", esito: "" },
    { min: 5, max: 10, stat: "50°", esito: "" },
    { min: 2, max: 4, stat: "25°", esito: "" },
    { min: 1, max: 1, stat: "10°", esito: "" },
    { min: 0, max: 0, stat: "1°", esito: "" },
  ],
};

// ===============================
// ✅ FEMALE NORMS
// ===============================

const FEMALE_NORMS: NormGroup = {
  disattenzione: [
    { min: 25, max: 27, stat: ">99°", esito: "fortemente sintomatico" },
    { min: 23, max: 24, stat: "99°", esito: "fortemente sintomatico" },
    { min: 19, max: 22, stat: "98°", esito: "moderatamente sintomatico" },
    { min: 18, max: 18, stat: "96°-97°", esito: "moderatamente sintomatico" },
    { min: 17, max: 17, stat: "93°-95°", esito: "lievemente sintomatico" },
    { min: 15, max: 16, stat: "92°", esito: "" },
    { min: 14, max: 14, stat: "90°-91°", esito: "" },
    { min: 13, max: 13, stat: "88°-89°", esito: "" },
    { min: 12, max: 12, stat: "86°-87°", esito: "" },
    { min: 11, max: 11, stat: "84°-85°", esito: "" },
    { min: 9, max: 10, stat: "80°", esito: "" },
    { min: 7, max: 8, stat: "75°", esito: "" },
    { min: 3, max: 6, stat: "50°", esito: "" },
    { min: 1, max: 3, stat: "25°", esito: "" },
    { min: 0, max: 0, stat: "1°-10°", esito: "" },
  ],

  iperattivita_impulsivita: [
    { min: 20, max: 27, stat: ">99°", esito: "fortemente sintomatico" },
    { min: 19, max: 19, stat: "99°", esito: "fortemente sintomatico" },
    { min: 12, max: 18, stat: "98°", esito: "moderatamente sintomatico" },
    { min: 11, max: 11, stat: "97°", esito: "moderatamente sintomatico" },
    { min: 10, max: 10, stat: "96°", esito: "moderatamente sintomatico" },
    { min: 9, max: 9, stat: "95°", esito: "lievemente sintomatico" },
    { min: 8, max: 8, stat: "93°-94°", esito: "lievemente sintomatico" },
    { min: 7, max: 7, stat: "92°", esito: "" },
    { min: 6, max: 6, stat: "89°-91°", esito: "" },
    { min: 5, max: 5, stat: "86°-88°", esito: "" },
    { min: 4, max: 4, stat: "84°-85°", esito: "" },
    { min: 3, max: 3, stat: "75°-80°", esito: "" },
    { min: 1, max: 2, stat: "50°", esito: "" },
    { min: 0, max: 0, stat: "1°-25°", esito: "" },
  ],

  totale: [
    { min: 42, max: 54, stat: ">99°", esito: "fortemente sintomatico" },
    { min: 36, max: 41, stat: "99°", esito: "fortemente sintomatico" },
    { min: 32, max: 35, stat: "98°", esito: "moderatamente sintomatico" },
    { min: 28, max: 31, stat: "97°", esito: "moderatamente sintomatico" },
    { min: 25, max: 27, stat: "96°", esito: "moderatamente sintomatico" },
    { min: 24, max: 24, stat: "95°", esito: "lievemente sintomatico" },
    { min: 23, max: 23, stat: "94°", esito: "lievemente sintomatico" },
    { min: 21, max: 22, stat: "93°", esito: "lievemente sintomatico" },
    { min: 20, max: 20, stat: "91°-92°", esito: "" },
    { min: 19, max: 19, stat: "90°", esito: "" },
    { min: 18, max: 18, stat: "88°-89°", esito: "" },
    { min: 17, max: 17, stat: "87°", esito: "" },
    { min: 16, max: 16, stat: "86°", esito: "" },
    { min: 15, max: 15, stat: "84°-85°", esito: "" },
    { min: 12, max: 14, stat: "80°", esito: "" },
    { min: 10, max: 11, stat: "75°", esito: "" },
    { min: 4, max: 9, stat: "50°", esito: "" },
    { min: 1, max: 3, stat: "25°", esito: "" },
    { min: 0, max: 0, stat: "1°-10°", esito: "" },
  ],
};

// ===============================
// ✅ IMPAIRMENT NORMS
// ===============================

const MALE_IMPAIRMENT_NORMS: ImpairmentNorms = {
  relazioni_familiari: {
    stat: { 0: "70°", 1: "95°", 2: "98°", 3: "99°" },
    esito: {
      0: "",
      1: "lievemente sintomatico",
      2: "moderatamente sintomatico",
      3: "fortemente sintomatico",
    },
  },
  relazioni_pari: {
    stat: { 0: "80°", 1: "95°", 2: "99°", 3: "99°" },
    esito: {
      0: "",
      1: "lievemente sintomatico",
      2: "fortemente sintomatico",
      3: "fortemente sintomatico",
    },
  },
  compiti_scolastici: {
    stat: { 0: "55°", 1: "85°", 2: "95°", 3: "99°" },
    esito: {
      0: "",
      1: "",
      2: "lievemente sintomatico",
      3: "fortemente sintomatico",
    },
  },
  rendimento_scolastico: {
    stat: { 0: "60°", 1: "85°", 2: "95°", 3: "99°" },
    esito: {
      0: "",
      1: "",
      2: "lievemente sintomatico",
      3: "fortemente sintomatico",
    },
  },
  comportamento: {
    stat: { 0: "75°", 1: "95°", 2: "99°", 3: "99°" },
    esito: {
      0: "",
      1: "lievemente sintomatico",
      2: "fortemente sintomatico",
      3: "fortemente sintomatico",
    },
  },
  autostima: {
    stat: { 0: "75°", 1: "95°", 2: "99°", 3: "99°" },
    esito: {
      0: "",
      1: "lievemente sintomatico",
      2: "fortemente sintomatico",
      3: "fortemente sintomatico",
    },
  },
};

const FEMALE_IMPAIRMENT_NORMS: ImpairmentNorms = {
  relazioni_familiari: {
    stat: { 0: "60°", 1: "85°", 2: "95°", 3: "99°" },
    esito: {
      0: "",
      1: "",
      2: "lievemente sintomatico",
      3: "fortemente sintomatico",
    },
  },
  relazioni_pari: {
    stat: { 0: "70°", 1: "90°", 2: "98°", 3: "99°" },
    esito: {
      0: "",
      1: "",
      2: "moderatamente sintomatico",
      3: "fortemente sintomatico",
    },
  },
  compiti_scolastici: {
    stat: { 0: "60°", 1: "90°", 2: "98°", 3: "99°" },
    esito: {
      0: "",
      1: "",
      2: "moderatamente sintomatico",
      3: "fortemente sintomatico",
    },
  },
  rendimento_scolastico: {
    stat: { 0: "65°", 1: "85°", 2: "98°", 3: "99°" },
    esito: {
      0: "",
      1: "",
      2: "moderatamente sintomatico",
      3: "fortemente sintomatico",
    },
  },
  comportamento: {
    stat: { 0: "85°", 1: "95°", 2: "98°", 3: "99°" },
    esito: {
      0: "",
      1: "lievemente sintomatico",
      2: "moderatamente sintomatico",
      3: "fortemente sintomatico",
    },
  },
  autostima: {
    stat: { 0: "65°", 1: "93°", 2: "98°", 3: "99°" },
    esito: {
      0: "",
      1: "lievemente sintomatico",
      2: "moderatamente sintomatico",
      3: "fortemente sintomatico",
    },
  },
};

// ===============================
// ✅ HELPERS
// ===============================

function classify(
  score: number,
  rows: RangeRow[],
): { stat: Stat; esito: Esito } {
  const matches: { stat: Stat; esito: Esito }[] = [];

  for (const r of rows) {
    if (score >= r.min && score <= r.max) {
      matches.push({ stat: r.stat, esito: r.esito });
    }
  }

  // If multiple matches, combine the STAT values into a range
  if (matches.length > 1) {
    const stats = matches.map((m) => m.stat).filter((s) => !s.includes("°"));
    if (stats.length > 1) {
      const nums = stats.map((s) => parseInt(s));
      const minStat = Math.min(...nums);
      const maxStat = Math.max(...nums);
      return {
        stat: `${minStat}-${maxStat}°`,
        esito: matches[0].esito,
      };
    }
  }

  if (matches.length > 0) {
    return matches[0];
  }

  return { stat: "", esito: "" };
}

function classifyImpairment(
  score: number,
  norms: ImpairmentNorm,
): { stat: Stat; esito: Esito } {
  const stat = norms.stat[score] || "";
  const esito = norms.esito[score] || "";
  return { stat, esito };
}

/**
 * UI sometimes sends:
 * - "Mai o raramente__0"
 * - "0__0"
 * - { label: "Mai o raramente" }
 * - { value: 1 } / { id: 0 }
 *2- 0
3*/
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
// COMPUTE (with gender-based norms)
// ===============================

export type ComputeCtx = { patientGender?: "M" | "F" | null };

export function computeADHDRS5GenitoreOther(
  answers: Record<string, any>,
  ctx?: ComputeCtx,
) {
  // Part 1: Symptoms (questions 1-18)
  const scores_1_9: number[] = [];
  const scores_10_18: number[] = [];

  for (let i = 1; i <= 9; i++) {
    scores_1_9.push(toScore(answers[qKey(i)]));
  }
  for (let i = 10; i <= 18; i++) {
    scores_10_18.push(toScore(answers[qKey(i)]));
  }

  const disattenzione_punteggio = scores_1_9.reduce((a, b) => a + b, 0);
  const iperattivita_impulsivita_punteggio = scores_10_18.reduce(
    (a, b) => a + b,
    0,
  );
  const totale_punteggio =
    disattenzione_punteggio + iperattivita_impulsivita_punteggio;

  // Part 2: Impairment (questions 19-24)
  const impairment_scores = {
    relazioni_familiari: toScore(answers[qKey(19)]),
    relazioni_pari: toScore(answers[qKey(20)]),
    compiti_scolastici: toScore(answers[qKey(21)]),
    rendimento_scolastico: toScore(answers[qKey(22)]),
    comportamento: toScore(answers[qKey(23)]),
    autostima: toScore(answers[qKey(24)]),
  };

  // Determine gender and select appropriate norms
  const gender: GenderKey = ctx?.patientGender === "F" ? "FEMALE" : "MALE";
  const norms = gender === "MALE" ? MALE_NORMS : FEMALE_NORMS;
  const impairmentNorms =
    gender === "MALE" ? MALE_IMPAIRMENT_NORMS : FEMALE_IMPAIRMENT_NORMS;

  // Classify scores
  const disattenzione = classify(disattenzione_punteggio, norms.disattenzione);
  const iperattivita_impulsivita = classify(
    iperattivita_impulsivita_punteggio,
    norms.iperattivita_impulsivita,
  );
  const totale = classify(totale_punteggio, norms.totale);

  // Classify impairments
  const impairment_results = {
    relazioni_familiari: classifyImpairment(
      impairment_scores.relazioni_familiari,
      impairmentNorms.relazioni_familiari,
    ),
    relazioni_pari: classifyImpairment(
      impairment_scores.relazioni_pari,
      impairmentNorms.relazioni_pari,
    ),
    compiti_scolastici: classifyImpairment(
      impairment_scores.compiti_scolastici,
      impairmentNorms.compiti_scolastici,
    ),
    rendimento_scolastico: classifyImpairment(
      impairment_scores.rendimento_scolastico,
      impairmentNorms.rendimento_scolastico,
    ),
    comportamento: classifyImpairment(
      impairment_scores.comportamento,
      impairmentNorms.comportamento,
    ),
    autostima: classifyImpairment(
      impairment_scores.autostima,
      impairmentNorms.autostima,
    ),
  };

  return {
    // Part 1: Symptoms
    "Disattenzione punteggio PG": String(disattenzione_punteggio),
    "Disattenzione punteggio STAT": disattenzione.stat,
    "Disattenzione punteggio ESITO": disattenzione.esito,

    "Iperattività/Impulsività punteggio PG": String(
      iperattivita_impulsivita_punteggio,
    ),
    "Iperattività/Impulsività punteggio STAT": iperattivita_impulsivita.stat,
    "Iperattività/Impulsività punteggio ESITO": iperattivita_impulsivita.esito,

    "Totale PG": String(totale_punteggio),
    "Totale STAT": totale.stat,
    "Totale ESITO": totale.esito,

    // Part 2: Impairment
    "Relazioni familiari PG": String(impairment_scores.relazioni_familiari),
    "Relazioni familiari STAT": impairment_results.relazioni_familiari.stat,
    "Relazioni familiari ESITO": impairment_results.relazioni_familiari.esito,

    "Relazioni pari PG": String(impairment_scores.relazioni_pari),
    "Relazioni pari STAT": impairment_results.relazioni_pari.stat,
    "Relazioni pari ESITO": impairment_results.relazioni_pari.esito,

    "Compiti scolastici PG": String(impairment_scores.compiti_scolastici),
    "Compiti scolastici STAT": impairment_results.compiti_scolastici.stat,
    "Compiti scolastici ESITO": impairment_results.compiti_scolastici.esito,

    "Rendimento scolastico PG": String(impairment_scores.rendimento_scolastico),
    "Rendimento scolastico STAT": impairment_results.rendimento_scolastico.stat,
    "Rendimento scolastico ESITO":
      impairment_results.rendimento_scolastico.esito,

    "Comportamento PG": String(impairment_scores.comportamento),
    "Comportamento STAT": impairment_results.comportamento.stat,
    "Comportamento ESITO": impairment_results.comportamento.esito,

    "Autostima PG": String(impairment_scores.autostima),
    "Autostima STAT": impairment_results.autostima.stat,
    "Autostima ESITO": impairment_results.autostima.esito,

    // Metadata
    "Gender used": gender,
  };
}
