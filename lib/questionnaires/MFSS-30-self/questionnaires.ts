import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS = [
  { label: "Assolutamente falso", value: 0 },
  { label: "Più falso che vero", value: 1 },
  { label: "Più vero che falso", value: 2 },
  { label: "Assolutamente vero", value: 3 },
] as const;

const QUESTIONS_1_30: string[] = [
  "Quando mi accade qualcosa di importante, di solito ripercorro con la mente ogni fatto accaduto per comprendere le ragioni che lo hanno determinato.",
  'Spesso mi capita di non riuscire a "sintonizzarmi" con le emozioni che provano le persone con le quali entro in contatto.',
  "Solitamente comprendo molto bene ciò che una persona vuole comunicarmi e le sue vere intenzioni, a prescindere dalle apparenze o da ciò che dice.",
  "Spesso non so quale aggettivo usare per descrivere una mia emozione.",
  "Ho difficoltà a riconoscere gli stati d'animo degli altri e a dare loro un nome (cioè, non riesco a riconoscere cosa loro stanno provando e quali parole potrebbero essere usate per descrivere quello che provano).",
  "Solitamente non ho nessuna difficoltà a capire gli scopi reali di una persona che si avvicina a me.",
  'Quando parlo con qualcuno, provo spesso a mettermi "nei suoi panni", a guardare le cose dal suo punto di vista.',
  "Quando affronto situazioni importanti o delicate, cerco sempre di fare tesoro delle esperienze precedenti per evitare conseguenze negative.",
  "Ci sono dei momenti nei quali mi sento strano, ma non riesco a comprendere il tipo di sensazione che sto provando.",
  "Mi è capitato spesso di fraintendere delle emozioni che altri mostravano nei miei confronti (cioè non ho capito cosa loro stessero realmente provando).",
  "Ho avuto dei conflitti con persone a me vicine, perché loro non si sentivano capite da me.",
  "Gli altri mi giudicano una persona impulsiva, che non si cura delle conseguenze delle proprie azioni sugli altri, ma io non me ne rendo conto.",
  "Gli altri possono influenzarmi negativamente con il potere della loro mente.",
  "Non mi è facile trovare le parole più appropriate per descrivere i miei sentimenti.",
  "Non ci metto molto a capire quali emozioni può provare la persona che ho davanti.",
  "Quando ho un problema prima cerco di analizzarlo nei dettagli, poi raccolgo più informazioni possibili per affrontarlo, e poi passo all'azione.",
  "Per me non è difficile ripensare mentalmente alle fasi più importanti, i momenti e i passaggi della mia giornata, che hanno determinato alcuni miei insuccessi o disavventure.",
  "Quando parlo con le persone in situazioni difficili (ad esempio, se sono arrabbiato o triste) senza che esse si possano offendere.",
  "Per me non è difficile ricordare quali sensazioni o sentimenti sta provando la persona con cui sto parlando, e se poi io sbaglio nella mia relazione è perché ho dato una risposta inadeguata.",
  "Gli altri mi dicono che so ascoltare e capire.",
  'Prima di giudicare qualcuno mi immedesimo in lui e mi chiedo: "Io al suo posto come mi sarei comportato?".',
  "Quando vivo un momento difficile oppure ho un problema cerco di dedicarmi ad altre cose; ci penserà il destino a risolvere tutto.",
  "Odio pensare oggi a ciò che potrà accadermi domani.",
  "La realtà non è poi così lontana dal sogno o dalla fantasia, e a me piace confonderle oppure mi capita di farlo.",
  "Non sono molto bravo a descrivere con le parole quello che provo.",
  "Non mi capita di parlare con le persone (anche con quelle a me vicine) delle loro emozioni, né di confrontarmi con loro su questi argomenti.",
  'Mi capita abbastanza spesso di capire "fischi per fiaschi" (cioè di non sintonizzarmi sulla "lunghezza d\'onda" degli altri, di non capire cosa vogliono e qual è il loro scopo).',
  "Non siamo tutti uguali, e per questo è opportuno rispettare ogni persona per quello che è.",
  "Quando attraverso un momento difficile, o mi trovo davanti ad un problema, non seguo mai il mio istinto; sono invece portato a riflettere e a valutare la situazione molte volte.",
  "Quando devo affrontare un momento difficile oppure un problema, non seguo mai il mio istinto; sono invece portato a riflettere e a valutare la situazione molte volte.",
];

// Reverse-scored items (scoring 3,2,1,0 instead of 0,1,2,3)
const REVERSE_ITEMS: number[] = [
  2, 5, 11, 12, 13, 17, 18, 19, 20, 23, 24, 25, 26, 27, 28,
];

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

export const MFSS30_SELF: QuestionnaireDef = {
  code: "MFSS30_SELF",
  formCode: "MFSS30_SELF",
  type: "SELF",
  name: "MFSS30_SELF",
  instruction:
    "Le seguenti affermazioni descrivono alcuni modi di essere delle persone. Legga gentilmente ogni affermazione e indichi quanto ciascuna di esse è adatta a descriverLa.",
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito = "deficit grave" | "deficit" | "limite" | "";

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
    // Reverse: 0→3, 1→2, 2→1, 3→0
    return 3 - rawScore;
  }

  return rawScore;
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

// Normative data: M and SD for males and females
const NORMS = {
  MALE: {
    scala_totale: { M: 56.3, SD: 11.07 },
    CRE: { M: 9.61, SD: 3.64 },
    CRC: { M: 15.32, SD: 4.13 },
    CDD: { M: 23.25, SD: 5.01 },
    CDP: { M: 8.12, SD: 2.18 },
  },
  FEMALE: {
    scala_totale: { M: 59.52, SD: 12.94 },
    CRE: { M: 9.92, SD: 4.23 },
    CRC: { M: 16.36, SD: 4.25 },
    CDD: { M: 25.21, SD: 5.45 },
    CDP: { M: 8.03, SD: 2.13 },
  },
};

function calculateZScore(pg: number, M: number, SD: number): number {
  return (pg - M) / SD;
}

function getEsitoFromZ(z: number): Esito {
  if (z <= -2.0) return "deficit grave";
  if (z >= -1.99 && z <= -1.6) return "deficit";
  if (z >= -1.59 && z <= -1.0) return "limite";
  return "";
}

export function computeMFSS30Self(
  answers: Record<string, any>,
  ctx?: ComputeCtx,
) {
  // Get scores for all 30 questions
  const scores: number[] = [];
  for (let i = 1; i <= 30; i++) {
    scores.push(toScore(answers[qKey(i)], i));
  }

  const sex = normalizeSex(ctx?.patientSex ?? ctx?.patientGender);
  const genderUsed = sex === "F" ? "FEMALE" : sex === "M" ? "MALE" : "";

  const norms = sex === "F" ? NORMS.FEMALE : NORMS.MALE;

  // Scala totale: sum of all 30 items
  const scala_totale = scores.reduce((a, b) => a + b, 0);
  const z_totale = calculateZScore(
    scala_totale,
    norms.scala_totale.M,
    norms.scala_totale.SD,
  );
  const esito_totale = getEsitoFromZ(z_totale);

  // CRE: items 4,9,10,14,19,26
  const cre_items = [4, 9, 10, 14, 19, 26];
  const cre_pg = cre_items.reduce((sum, i) => sum + scores[i - 1], 0);
  const z_cre = calculateZScore(cre_pg, norms.CRE.M, norms.CRE.SD);
  const esito_cre = getEsitoFromZ(z_cre);

  // CRC: items 11,12,13,17,18,23,24,25
  const crc_items = [11, 12, 13, 17, 18, 23, 24, 25];
  const crc_pg = crc_items.reduce((sum, i) => sum + scores[i - 1], 0);
  const z_crc = calculateZScore(crc_pg, norms.CRC.M, norms.CRC.SD);
  const esito_crc = getEsitoFromZ(z_crc);

  // CDD: items 2,3,5,6,7,15,20,21,22,27,28,29
  const cdd_items = [2, 3, 5, 6, 7, 15, 20, 21, 22, 27, 28, 29];
  const cdd_pg = cdd_items.reduce((sum, i) => sum + scores[i - 1], 0);
  const z_cdd = calculateZScore(cdd_pg, norms.CDD.M, norms.CDD.SD);
  const esito_cdd = getEsitoFromZ(z_cdd);

  // CDP: items 1,8,16,30
  const cdp_items = [1, 8, 16, 30];
  const cdp_pg = cdp_items.reduce((sum, i) => sum + scores[i - 1], 0);
  const z_cdp = calculateZScore(cdp_pg, norms.CDP.M, norms.CDP.SD);
  const esito_cdp = getEsitoFromZ(z_cdp);

  return {
    "Scala totale PG": String(scala_totale),
    "Scala totale STAT": `Z= ${z_totale.toFixed(2)}`,
    "Scala totale ESITO": esito_totale,

    "Capacità di riconoscere le emozioni (CRE) PG": String(cre_pg),
    "Capacità di riconoscere le emozioni (CRE) STAT": `Z= ${z_cre.toFixed(2)}`,
    "Capacità di riconoscere le emozioni (CRE) ESITO": esito_cre,

    "Capacità di cogliere relazioni causali (CRC) PG": String(crc_pg),
    "Capacità di cogliere relazioni causali (CRC) STAT": `Z= ${z_crc.toFixed(2)}`,
    "Capacità di cogliere relazioni causali (CRC) ESITO": esito_crc,

    "Capacità di decentramento (CDD) PG": String(cdd_pg),
    "Capacità di decentramento (CDD) STAT": `Z= ${z_cdd.toFixed(2)}`,
    "Capacità di decentramento (CDD) ESITO": esito_cdd,

    "Capacità di ponderazione (CDP) PG": String(cdp_pg),
    "Capacità di ponderazione (CDP) STAT": `Z= ${z_cdp.toFixed(2)}`,
    "Capacità di ponderazione (CDP) ESITO": esito_cdp,

    "Gender used": genderUsed,
  };
}
