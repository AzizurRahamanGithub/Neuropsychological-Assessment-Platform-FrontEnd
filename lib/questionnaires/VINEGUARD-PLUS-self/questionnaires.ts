import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS = [
  { label: "SÌ", value: 1 },
  { label: "NO", value: 0 },
] as const;

const QUESTIONS_1_26: string[] = [
  "Le capita di avere difficoltà nel distinguere la destra dalla sinistra?",
  "Le risulta complesso consultare le mappe o trovare una direzione in luoghi che non Le sono familiari?",
  "Le piace leggere ad alta voce?",
  "Nota di impiegare più tempo della media per leggere una pagina di un libro?",
  "Le capita di dimenticare il significato di ciò che ha appena letto?",
  "Le piace leggere libri lunghi?",
  "Quando scrive, Le succede di commettere errori ortografici?",
  "La Sua scrittura risulta talvolta difficile da leggere o poco chiara?",
  "Va in confusione o fatica nell'esprimersi quando deve parlare in pubblico?",
  "Durante telefonate, Le risulta difficile annotare correttamente un messaggio per poi riferirlo?",
  "Le capita di avere difficoltà nel pronunciare correttamente parole lunghe o complesse?",
  "Trova complicato eseguire calcoli a mente senza supporti (dita, foglio, calcolatrice)?",
  "Le succede di invertire la posizione delle cifre quando compone un numero di telefono?",
  "Le è difficile elencare fluentemente i mesi dell'anno in avanti?",
  "Le risulta particolarmente complicato ripetere i mesi dell'anno all'indietro?",
  "Le capita di confondere date, orari o di dimenticare appuntamenti programmati?",
  "Nel compilare documenti o note importanti, Le succede frequentemente di commettere errori?",
  "Trova difficoltoso compilare moduli o bollettini di versamento?",
  "Le capita spesso di confondere numeri simili (es. 6/9 oppure 95/59) in contesti quotidiani?",
  "Ricorda di aver avuto difficoltà ad apprendere le tabelline durante la scuola?",
  "Ha un ritmo di scrittura più lento rispetto agli altri, o tende a rimanere indietro?",
  "Le risulta faticoso prendere appunti in modo efficace?",
  "Le capita frequentemente di commettere errori mentre legge?",
  "Ha riscontrato difficoltà nell'apprendere lingue straniere?",
  "Le è difficile verificare il resto dopo un pagamento?",
  "Trova particolarmente impegnativo svolgere calcoli scritti (come addizioni, sottrazioni, divisioni)?",
];

// Reverse-scored items (questions where "NO" = positive, "SÌ" = negative)
const REVERSE_ITEMS: number[] = [3, 6];

const questions: Question[] = QUESTIONS_1_26.map(
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

export const VINEGUARDPLUS_SELF: QuestionnaireDef = {
  code: "VINEGUARDPLUS_SELF",
  formCode: "VINEGUARDPLUS_SELF",
  type: "SELF",
  name: "VINEGUARDPLUS_SELF",
  instruction:
    'Voglia gentilmente rispondere alle affermazioni indicate, selezionando per ciascuna la risposta "Sì" oppure "No", in base a ciò che descrive meglio la Sua esperienza attuale e passata. Le risposte si riferiscono al funzionamento abituale nella lettura, nella scrittura, nel calcolo, nella gestione degli apprendimenti e delle informazioni nella vita quotidiana.',
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito = "sintomatico" | "limite" | "";

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
    // Reverse: 0→1, 1→0
    return 1 - rawScore;
  }

  return rawScore;
}

// ===============================
// COMPUTE
// ===============================

export type ComputeCtx = {
  patientAge?: number | null;
  patientGender?: string | null;
  patientEducation?: number | null; // years of education
};

function getEsito(pg: number, education: number | null): Esito {
  // Default to ≤12 if education not provided
  if (education == null || education <= 12) {
    // ≤12 years: limite if 11-12, sintomatico if ≥13
    if (pg >= 13) return "sintomatico";
    if (pg >= 11 && pg <= 12) return "limite";
    return "";
  } else if (education === 13) {
    // 13 years: limite if 9, sintomatico if ≥10
    if (pg >= 10) return "sintomatico";
    if (pg === 9) return "limite";
    return "";
  } else {
    // >13 years: limite if 8-10, sintomatico if ≥11
    if (pg >= 11) return "sintomatico";
    if (pg >= 8 && pg <= 10) return "limite";
    return "";
  }
}

function getCutoff(education: number | null): string {
  if (education == null || education <= 12) return "≥13";
  if (education === 13) return "≥10";
  return "≥11";
}

export function computeVINEGUARDPLUSSelf(
  answers: Record<string, any>,
  ctx?: ComputeCtx,
) {
  // Get scores for all 26 questions
  const scores: number[] = [];
  for (let i = 1; i <= 26; i++) {
    scores.push(toScore(answers[qKey(i)], i));
  }

  const education = ctx?.patientEducation ?? null;

  // Caratteristiche generali: items 1,2,9,14,15,16,18,24
  const caratteristiche_items = [1, 2, 9, 14, 15, 16, 18, 24];
  const caratteristiche_pg = caratteristiche_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Lettura: items 3,4,5,6,11,23
  const lettura_items = [3, 4, 5, 6, 11, 23];
  const lettura_pg = lettura_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Scrittura: items 7,8,10,17,21,22
  const scrittura_items = [7, 8, 10, 17, 21, 22];
  const scrittura_pg = scrittura_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Calcolo: items 12,13,19,20,25,26
  const calcolo_items = [12, 13, 19, 20, 25, 26];
  const calcolo_pg = calcolo_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Scala totale: sum of all subscales
  const scala_totale =
    caratteristiche_pg + lettura_pg + scrittura_pg + calcolo_pg;

  const esito = getEsito(scala_totale, education);
  const cutoff = getCutoff(education);

  const educationGroup =
    education == null
      ? "not provided (using ≤12)"
      : education <= 12
        ? "≤12 years"
        : education === 13
          ? "13 years"
          : ">13 years";

  return {
    "Scala totale PG": String(scala_totale),
    "Scala totale CUTOFF": cutoff,
    "Scala totale ESITO": esito,

    "Caratteristiche generali PG": String(caratteristiche_pg),
    "Lettura PG": String(lettura_pg),
    "Scrittura PG": String(scrittura_pg),
    "Calcolo PG": String(calcolo_pg),

    "Education group used": educationGroup,
  };
}
