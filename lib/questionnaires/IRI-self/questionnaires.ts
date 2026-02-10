import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS = [
  { label: "Mai vera", value: 0 },
  { label: "Raramente vera", value: 1 },
  { label: "Qualche volta vera", value: 2 },
  { label: "Spesso vera", value: 3 },
  { label: "Sempre vera", value: 4 },
] as const;

const QUESTIONS_1_28: string[] = [
  "Sogni ad occhi aperti e fantastichi regolarmente sulle cose che potrebbero accaderti",
  "Provi spesso sentimenti di tenerezza e di preoccupazione per le persone meno fortunate",
  "A volte trovi difficile vedere le cose dal punto di vista di un altro",
  "A volte NON ti senti molto dispiaciuto per le persone che hanno dei problemi",
  "Resti veramente coinvolto dagli stati d'animo dei protagonisti di un racconto",
  "In situazioni d'emergenza, ti senti in tensione e a disagio",
  "Di solito riesci ad essere obiettivo quando guardi un film o una rappresentazione teatrale e raramente ti lasci coinvolgere del tutto",
  "In caso di disaccordo, cerchi di tenere conto del punto di vista dell'altro prima di prendere una decisione",
  "Quando vedi qualcuno che viene sfruttato, provi sentimenti di protezione nei suoi confronti",
  "A volte ti senti indifeso quando ti trovi in situazioni emotivamente coinvolgenti",
  "Generalmente cerchi di comprendere meglio gli altri immaginando le cose dalla loro prospettiva",
  "Ti accade raramente di sentirti coinvolto da un buon libro o da un bel film",
  "Quando vedi qualcuno farsi male tendi a rimanere calmo",
  "Le sventure degli altri NON ti turbano molto",
  "Se sei sicuro di avere ragione riguardo a qualcosa, non sprechi molto tempo ad ascoltare le argomentazioni degli altri",
  "Dopo aver visto una rappresentazione teatrale o un film, ti senti come fossi uno dei protagonisti",
  "Ti spaventi se ti trovi in situazioni che provocano tensione emotiva",
  "Quando vedi qualcuno che viene trattato ingiustamente, ti capita di non provare molta pietà per lui",
  "Sei di solito piuttosto efficiente nel far fronte alle situazioni d'emergenza",
  "Le cose che accadono, ti colpiscono molto spesso",
  "Credi che esistano due opposti aspetti in ogni vicenda e cerchi di prenderli in considerazione entrambi",
  "Potresti essere descritto come una persona dal cuore piuttosto tenero",
  "Quando guardi un buon film, riesci molto facilmente a metterti nei panni del personaggio principale",
  "Tendi a perdere il controllo in casi d'emergenza",
  'Quando sei in contrasto con qualcuno, di solito cerchi di "metterti nei suoi panni" per un attimo',
  "Quando leggi una storia o un racconto interessante, immagini come ti sentiresti se gli avvenimenti della storia accadessero a te",
  "Se vedi qualcuno che ha bisogno di aiuto in una situazione d'emergenza, non riesci a reagire",
  "Prima di criticare qualcuno, cerchi di immaginare cosa proverebbe se fosse al tuo posto",
];

// Reverse-scored items (scoring 4,3,2,1,0 instead of 0,1,2,3,4)
const REVERSE_ITEMS: number[] = [3, 4, 7, 12, 13, 14, 15, 18, 19];

const questions: Question[] = QUESTIONS_1_28.map(
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

export const IRI_SELF: QuestionnaireDef = {
  code: "IRI_SELF",
  formCode: "IRI_SELF",
  type: "SELF",
  name: "IRI_SELF",
  instruction:
    "Prendendo in considerazione il proprio comportamento, decida quanto secondo lei le seguenti affermazioni la descrivono, selezionando l'opzione corrispondente. Si prega di rispondere a tutte le domande.",
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito = "deficit" | "limite" | "";

function stripUiSuffix(v: unknown) {
  if (typeof v !== "string") return v;
  return v.split("__")[0].trim();
}

function toScore(ans: any, questionNumber: number): number {
  if (ans == null) return 0;

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
    // Reverse: 0→4, 1→3, 2→2, 3→1, 4→0
    return 4 - rawScore;
  }

  return rawScore;
}

// ===============================
// COMPUTE
// ===============================

export type ComputeCtx = {
  patientAge?: number | null;
  patientGender?: string | null;
  patientEducation?: number | null;
};

type Sex = "M" | "F" | null;

function normalizeSex(v: unknown): Sex {
  if (!v) return null;
  const s = String(v).trim().toUpperCase();
  if (s === "F" || s === "FEMALE") return "F";
  if (s === "M" || s === "MALE") return "M";
  return null;
}

function getPE(pc: number): number {
  if (pc <= 42.14) return 0;
  if (pc >= 42.15 && pc <= 50.86) return 1;
  if (pc >= 50.87 && pc <= 58.14) return 2;
  if (pc >= 58.15 && pc <= 65.14) return 3;
  return 4; // pc >= 65.15
}

function getPE_PT(pc: number): number {
  if (pc <= 9.71) return 0;
  if (pc >= 9.72 && pc <= 12.56) return 1;
  if (pc >= 12.57 && pc <= 15.02) return 2;
  if (pc >= 15.03 && pc <= 17.64) return 3;
  return 4; // pc >= 17.65
}

function getPE_F(pc: number): number {
  if (pc <= 7.78) return 0;
  if (pc >= 7.79 && pc <= 10.59) return 1;
  if (pc >= 10.6 && pc <= 12.88) return 2;
  if (pc >= 12.89 && pc <= 15.86) return 3;
  return 4; // pc >= 15.87
}

function getPE_PD(pc: number): number {
  if (pc <= 3.54) return 0;
  if (pc >= 3.55 && pc <= 6.05) return 1;
  if (pc >= 6.06 && pc <= 8.85) return 2;
  if (pc >= 8.86 && pc <= 11.48) return 3;
  return 4; // pc >= 11.49
}

function getPE_EC(pc: number): number {
  if (pc <= 11.68) return 0;
  if (pc >= 11.69 && pc <= 14.56) return 1;
  if (pc >= 14.57 && pc <= 17.11) return 2;
  if (pc >= 17.12 && pc <= 19.78) return 3;
  return 4; // pc >= 19.79
}

function getEsito(pe: number): Esito {
  if (pe === 0) return "deficit";
  if (pe === 1) return "limite";
  return "";
}

export function computeIRISelf(answers: Record<string, any>, ctx?: ComputeCtx) {
  // Get scores for all 28 questions
  const scores: number[] = [];
  for (let i = 1; i <= 28; i++) {
    scores.push(toScore(answers[qKey(i)], i));
  }

  const sex = normalizeSex(ctx?.patientGender);
  const age = ctx?.patientAge ?? null;
  const education = ctx?.patientEducation ?? null;

  const genderUsed = sex === "F" ? "FEMALE" : sex === "M" ? "MALE" : "";

  // Scala totale: all 28 items
  const scala_totale = scores.reduce((a, b) => a + b, 0);

  // Perspective taking (PT): items 3,8,11,15,21,25,28
  const pt_items = [3, 8, 11, 15, 21, 25, 28];
  const pt_pg = pt_items.reduce((sum, i) => sum + scores[i - 1], 0);

  // Fantasia (F): items 1,5,7,12,16,23,26
  const f_items = [1, 5, 7, 12, 16, 23, 26];
  const f_pg = f_items.reduce((sum, i) => sum + scores[i - 1], 0);

  // Disagio personale (PD): items 6,10,13,17,19,24,27
  const pd_items = [6, 10, 13, 17, 19, 24, 27];
  const pd_pg = pd_items.reduce((sum, i) => sum + scores[i - 1], 0);

  // Considerazione empatica (EC): items 2,4,9,14,18,20,22
  const ec_items = [2, 4, 9, 14, 18, 20, 22];
  const ec_pg = ec_items.reduce((sum, i) => sum + scores[i - 1], 0);

  // PC calculations (adjusted scores based on gender, age, education)
  const isFemale = sex === "F";

  // Scala totale PC
  const scala_totale_pc = isFemale ? scala_totale - 5.13 : scala_totale + 5.13;

  // PT PC: PG − 2.122739×(ln(education)−2.49627) − 0.855572 if F ; PG + 0.855572 if M
  let pt_pc = pt_pg;
  if (isFemale && education != null && education > 0) {
    pt_pc = pt_pg - 2.122739 * (Math.log(education) - 2.49627) - 0.855572;
  } else if (!isFemale) {
    pt_pc = pt_pg + 0.855572;
  }

  // F PC: PG + 0.072916×(age−45.3443) − 1.259155 if F ; PG + 1.259155 if M
  let f_pc = f_pg;
  if (isFemale && age != null) {
    f_pc = f_pg + 0.072916 * (age - 45.3443) - 1.259155;
  } else if (!isFemale) {
    f_pc = f_pg + 1.259155;
  }

  // PD PC: PG + 1.815441×(sqrt(education)−3.54256) − 1.423999 if F ; PG + 1.423999 if M
  let pd_pc = pd_pg;
  if (isFemale && education != null && education > 0) {
    pd_pc = pd_pg + 1.815441 * (Math.sqrt(education) - 3.54256) - 1.423999;
  } else if (!isFemale) {
    pd_pc = pd_pg + 1.423999;
  }

  // EC PC: PG − 1.904005×(ln(age)−3.695216) − 1.614596 if F ; PG + 1.614596 if M
  let ec_pc = ec_pg;
  if (isFemale && age != null && age > 0) {
    ec_pc = ec_pg - 1.904005 * (Math.log(age) - 3.695216) - 1.614596;
  } else if (!isFemale) {
    ec_pc = ec_pg + 1.614596;
  }

  // Calculate PE and ESITO
  const scala_totale_pe = getPE(scala_totale_pc);
  const scala_totale_esito = getEsito(scala_totale_pe);

  const pt_pe = getPE_PT(pt_pc);
  const pt_esito = getEsito(pt_pe);

  const f_pe = getPE_F(f_pc);
  const f_esito = getEsito(f_pe);

  const pd_pe = getPE_PD(pd_pc);
  const pd_esito = getEsito(pd_pe);

  const ec_pe = getPE_EC(ec_pc);
  const ec_esito = getEsito(ec_pe);

  return {
    "Scala totale PG": String(scala_totale),
    "Scala totale PC": scala_totale_pc.toFixed(2),
    "Scala totale STAT": `PE=${scala_totale_pe}`,
    "Scala totale ESITO": scala_totale_esito,

    "Perspective taking PG": String(pt_pg),
    "Perspective taking PC": pt_pc.toFixed(2),
    "Perspective taking STAT": `PE=${pt_pe}`,
    "Perspective taking ESITO": pt_esito,

    "Fantasia PG": String(f_pg),
    "Fantasia PC": f_pc.toFixed(2),
    "Fantasia STAT": `PE=${f_pe}`,
    "Fantasia ESITO": f_esito,

    "Disagio personale PG": String(pd_pg),
    "Disagio personale PC": pd_pc.toFixed(2),
    "Disagio personale STAT": `PE=${pd_pe}`,
    "Disagio personale ESITO": pd_esito,

    "Considerazione empatica PG": String(ec_pg),
    "Considerazione empatica PC": ec_pc.toFixed(2),
    "Considerazione empatica STAT": `PE=${ec_pe}`,
    "Considerazione empatica ESITO": ec_esito,

    "Gender used": genderUsed,
  };
}
