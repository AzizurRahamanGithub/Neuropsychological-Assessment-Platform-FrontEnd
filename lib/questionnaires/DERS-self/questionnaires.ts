import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS = [
  { label: "Quasi mai (0-10%)", value: 1 },
  { label: "A volte (11-35%)", value: 2 },
  { label: "Circa la metà delle volte (36-65%)", value: 3 },
  { label: "Molte volte (66-90%)", value: 4 },
  { label: "Quasi sempre (91-100%)", value: 5 },
] as const;

const QUESTIONS_1_33: string[] = [
  "Sono sereno riguardo a ciò che provo",
  "Presto attenzione a come mi sento",
  "Vivo le mie emozioni come travolgenti e fuori dal controllo",
  "Non ho idea di come mi sento",
  "Ho difficoltà a dare un senso a ciò che provo",
  "Presto attenzione alle mie emozioni",
  "So esattamente come mi sento",
  "Mi interessa come mi sento",
  "Sono confuso riguardo a ciò che provo",
  "Quando sono turbato, riconosco le mie emozioni",
  "Quando sono turbato, mi arrabbio con me stesso perché mi sento in quel modo",
  "Quando sono turbato, mi imbarazza sentirmi in quel modo",
  "Quando sono turbato, ho delle difficoltà a completare il mio lavoro",
  "Quando sono turbato, perdo il controllo",
  "Quando sono turbato, credo che rimarrò in quello stato per molto tempo",
  "Quando sono turbato, credo che finirò per sentirmi depresso",
  "Quando sono turbato, faccio fatica a focalizzarmi su altre cose",
  "Quando sono turbato, mi sento senza controllo",
  "Quando sono turbato, posso comunque finire le cose che devo fare",
  "Quando sono turbato, mi vergogno con me stesso perché mi sento in quel modo",
  "Quando sono turbato, so che alla fine posso trovare un modo per sentirmi meglio",
  "Quando sono turbato, mi sento debole",
  "Quando sono turbato, sento di potere avere ancora il controllo dei miei comportamenti",
  "Quando sono turbato, mi sento in colpa perché mi sento in quel modo",
  "Quando sono turbato, ho delle difficoltà a concentrarmi",
  "Quando sono turbato, ho delle difficoltà nel controllare i miei comportamenti",
  "Quando sono turbato, credo che non ci sia niente che io possa fare per sentirmi meglio",
  "Quando sono turbato, mi irrito con me stesso perché mi sento in quel modo",
  "Quando sono turbato, inizio a sentirmi molto male con me stesso",
  "Quando sono turbato, credo che crogiolarmi in questa emozione sia l'unica cosa che io possa fare",
  "Quando sono turbato, perdo il controllo sui miei comportamenti",
  "Quando sono turbato, faccio fatica a pensare a qualcosa di diverso",
  "Quando sono turbato, mi ci vuole molto tempo per sentirmi meglio",
];

// Reverse-scored items (scored 5,4,3,2,1 instead of 1,2,3,4,5)
const REVERSE_ITEMS: number[] = [1, 2, 6, 7, 8, 10, 19, 21, 23];

const questions: Question[] = QUESTIONS_1_33.map(
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

export const DERS_SELF: QuestionnaireDef = {
  code: "DERS_SELF",
  formCode: "DERS_SELF",
  type: "SELF",
  name: "DERS_SELF",
  instruction:
    "Indichi cortesemente quanto spesso (i.e. con che frequenza) le seguenti affermazioni possono essere applicate alla sua esperienza personale.",
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito = "fortemente sintomatico" | "sintomatico" | "limite" | "";

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
    // Reverse: 1→5, 2→4, 3→3, 4→2, 5→1
    return 6 - rawScore;
  }

  return rawScore;
}

// ===============================
// NORMATIVE DATA & T-SCORE CONVERSION
// ===============================

// Normative data: Mean and Standard Deviation for each scale
const NORMS = {
  ac: { mean: 11.5, sd: 4.58 }, // Mancanza di accettazione
  dis: { mean: 12.83, sd: 4.61 }, // Difficoltà nella distrazione
  fid: { mean: 10.89, sd: 3.71 }, // Mancanza di fiducia
  con: { mean: 10.55, sd: 4.52 }, // Mancanza di controllo
  ric: { mean: 8.05, sd: 2.8 }, // Difficoltà nel riconoscimento
  aut: { mean: 5.8, sd: 2.76 }, // Ridotta autoconsapevolezza
  tot: { mean: 61.83, sd: 15.38 }, // Scala totale
};

// Convert raw score to Z-score
function calculateZScore(pg: number, mean: number, sd: number): number {
  return (pg - mean) / sd;
}

// Convert Z-score to T-score
function calculateTScore(z: number): number {
  return 50 + z * 10;
}

// Determine ESITO based on T-score
function getEsitoFromT(t: number): Esito {
  if (t >= 70.0) return "fortemente sintomatico";
  if (t >= 67.0 && t <= 69.99) return "sintomatico";
  if (t >= 60.0 && t <= 66.99) return "limite";
  return "";
}

// ===============================
// COMPUTE
// ===============================

export type ComputeCtx = {
  patientSex?: string | null;
  patientGender?: string | null;
};

export function computeDERSSelf(
  answers: Record<string, any>,
  ctx?: ComputeCtx,
) {
  // Get scores for all 33 questions
  const scores: number[] = [];
  for (let i = 1; i <= 33; i++) {
    scores.push(toScore(answers[qKey(i)], i));
  }

  // Scala totale: sum of all 33 items
  const scala_totale = scores.reduce((a, b) => a + b, 0);
  const z_totale = calculateZScore(scala_totale, NORMS.tot.mean, NORMS.tot.sd);
  const t_totale = calculateTScore(z_totale);
  const esito_totale = getEsitoFromT(t_totale);

  // Mancanza di accettazione (ac): items 11,12,20,24,28,29
  const ac_items = [11, 12, 20, 24, 28, 29];
  const ac_pg = ac_items.reduce((sum, i) => sum + scores[i - 1], 0);
  const z_ac = calculateZScore(ac_pg, NORMS.ac.mean, NORMS.ac.sd);
  const t_ac = calculateTScore(z_ac);
  const esito_ac = getEsitoFromT(t_ac);

  // Difficoltà nella distrazione (dis): items 13,17,22,25,32
  const dis_items = [13, 17, 22, 25, 32];
  const dis_pg = dis_items.reduce((sum, i) => sum + scores[i - 1], 0);
  const z_dis = calculateZScore(dis_pg, NORMS.dis.mean, NORMS.dis.sd);
  const t_dis = calculateTScore(z_dis);
  const esito_dis = getEsitoFromT(t_dis);

  // Mancanza di fiducia (fid): items 1,15,16,19,21,23,27,30
  const fid_items = [1, 15, 16, 19, 21, 23, 27, 30];
  const fid_pg = fid_items.reduce((sum, i) => sum + scores[i - 1], 0);
  const z_fid = calculateZScore(fid_pg, NORMS.fid.mean, NORMS.fid.sd);
  const t_fid = calculateTScore(z_fid);
  const esito_fid = getEsitoFromT(t_fid);

  // Mancanza di controllo (con): items 3,14,18,26,31,33
  const con_items = [3, 14, 18, 26, 31, 33];
  const con_pg = con_items.reduce((sum, i) => sum + scores[i - 1], 0);
  const z_con = calculateZScore(con_pg, NORMS.con.mean, NORMS.con.sd);
  const t_con = calculateTScore(z_con);
  const esito_con = getEsitoFromT(t_con);

  // Difficoltà nel riconoscimento (ric): items 4,5,7,9,10
  const ric_items = [4, 5, 7, 9, 10];
  const ric_pg = ric_items.reduce((sum, i) => sum + scores[i - 1], 0);
  const z_ric = calculateZScore(ric_pg, NORMS.ric.mean, NORMS.ric.sd);
  const t_ric = calculateTScore(z_ric);
  const esito_ric = getEsitoFromT(t_ric);

  // Ridotta autoconsapevolezza (aut): items 2,6,8
  const aut_items = [2, 6, 8];
  const aut_pg = aut_items.reduce((sum, i) => sum + scores[i - 1], 0);
  const z_aut = calculateZScore(aut_pg, NORMS.aut.mean, NORMS.aut.sd);
  const t_aut = calculateTScore(z_aut);
  const esito_aut = getEsitoFromT(t_aut);

  return {
    // Scala totale
    "Scala totale PG": String(scala_totale),
    "Scala totale STAT": `T=${t_totale.toFixed(2)}`,
    "Scala totale ESITO": esito_totale,

    // Mancanza di accettazione
    "Mancanza di accettazione PG": String(ac_pg),
    "Mancanza di accettazione STAT": `T=${t_ac.toFixed(2)}`,
    "Mancanza di accettazione ESITO": esito_ac,

    // Difficoltà nella distrazione
    "Difficoltà nella distrazione PG": String(dis_pg),
    "Difficoltà nella distrazione STAT": `T=${t_dis.toFixed(2)}`,
    "Difficoltà nella distrazione ESITO": esito_dis,

    // Mancanza di fiducia
    "Mancanza di fiducia PG": String(fid_pg),
    "Mancanza di fiducia STAT": `T=${t_fid.toFixed(2)}`,
    "Mancanza di fiducia ESITO": esito_fid,

    // Mancanza di controllo
    "Mancanza di controllo PG": String(con_pg),
    "Mancanza di controllo STAT": `T=${t_con.toFixed(2)}`,
    "Mancanza di controllo ESITO": esito_con,

    // Difficoltà nel riconoscimento
    "Difficoltà nel riconoscimento PG": String(ric_pg),
    "Difficoltà nel riconoscimento STAT": `T=${t_ric.toFixed(2)}`,
    "Difficoltà nel riconoscimento ESITO": esito_ric,

    // Ridotta autoconsapevolezza
    "Ridotta autoconsapevolezza PG": String(aut_pg),
    "Ridotta autoconsapevolezza STAT": `T=${t_aut.toFixed(2)}`,
    "Ridotta autoconsapevolezza ESITO": esito_aut,
  };
}
