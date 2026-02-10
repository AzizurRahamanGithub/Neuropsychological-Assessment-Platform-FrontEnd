import type { QuestionnaireDef, Question } from "../types";
import { qKey } from "../utils";

// ===============================
// ✅ HADS (Hospital Anxiety and Depression Scale) — SELF
// ===============================
//
// Subscales (standard):
// - ANXIETY (HADS-A): items 1,3,5,7,9,11,13  (0–21)
// - DEPRESSION (HADS-D): items 2,4,6,8,10,12,14 (0–21)
//
// Severity (as in your sheet):
// - 0–7  : "" (non clinico / nella norma)
// - 8–10 : "lieve"
// - 11–14: "moderato"
// - 15–21: "grave"
//

type Esito = "" | "disturbo lieve" | "disturbo moderato" | "disturbo grave";

// ===============================
// ✅ QUESTIONS + OPTIONS (scored 0–3 each)
// ===============================

const QUESTIONS: Array<{
  number: number;
  text: string;
  options: Array<{ label: string; value: number }>;
}> = [
  {
    number: 1,
    text: "Mi sento teso/a o “con i nervi a fior di pelle”",
    options: [
      { label: "La maggior parte del tempo", value: 3 },
      { label: "Molto spesso", value: 2 },
      { label: "Ogni tanto", value: 1 },
      { label: "Per nulla", value: 0 },
    ],
  },
  {
    number: 2,
    text: "Mi sento rallentato/a",
    options: [
      { label: "Quasi sempre", value: 3 },
      { label: "Molto spesso", value: 2 },
      { label: "Ogni tanto", value: 1 },
      { label: "Per nulla", value: 0 },
    ],
  },
  {
    number: 3,
    text: "Mi viene una sensazione di paura come se stesse per succedere qualcosa di terribile",
    options: [
      { label: "Sì e in modo molto forte", value: 3 },
      { label: "Sì ma non troppo forte", value: 2 },
      { label: "Un po’, ma non mi preoccupa", value: 1 },
      { label: "Per nulla", value: 0 },
    ],
  },
  {
    number: 4,
    text: "Riesco ancora a ridere e vedere il lato divertente delle cose",
    options: [
      { label: "Assolutamente come ho sempre fatto", value: 0 },
      { label: "Non proprio come ho sempre fatto", value: 1 },
      { label: "Decisamente non come ho sempre fatto", value: 2 },
      { label: "Per nulla", value: 3 },
    ],
  },
  {
    number: 5,
    text: "Ho la testa piena di pensieri preoccupanti",
    options: [
      { label: "La maggior parte del tempo", value: 3 },
      { label: "Molto spesso", value: 2 },
      { label: "Ogni tanto, ma non troppo spesso", value: 1 },
      { label: "Solo occasionalmente", value: 0 },
    ],
  },
  {
    number: 6,
    text: "Mi sento di buon umore",
    options: [
      { label: "Mai", value: 3 },
      { label: "Qualche volta", value: 2 },
      { label: "Abbastanza spesso", value: 1 },
      { label: "La maggior parte del tempo", value: 0 },
    ],
  },
  {
    number: 7,
    text: "Riesco a stare seduto/a tranquillo/a e rilassarmi",
    options: [
      { label: "Sì, certamente", value: 0 },
      { label: "Di solito sì", value: 1 },
      { label: "Non molto", value: 2 },
      { label: "Per nulla", value: 3 },
    ],
  },
  {
    number: 8,
    text: "Mi sento come se fossi “rallentato/a”",
    options: [
      { label: "Quasi sempre", value: 3 },
      { label: "Molto spesso", value: 2 },
      { label: "Qualche volta", value: 1 },
      { label: "Per nulla", value: 0 },
    ],
  },
  {
    number: 9,
    text: "Provo una sensazione di paura, come un “nodo allo stomaco”",
    options: [
      { label: "Molto spesso", value: 3 },
      { label: "Abbastanza spesso", value: 2 },
      { label: "Ogni tanto", value: 1 },
      { label: "Per nulla", value: 0 },
    ],
  },
  {
    number: 10,
    text: "Ho perso interesse per il mio aspetto",
    options: [
      { label: "Decisamente", value: 3 },
      { label: "Non me ne curo come dovrei", value: 2 },
      { label: "Forse non me ne curo abbastanza", value: 1 },
      { label: "Me ne curo come ho sempre fatto", value: 0 },
    ],
  },
  {
    number: 11,
    text: "Mi sento irrequieto/a come se dovessi essere sempre in movimento",
    options: [
      { label: "Molto", value: 3 },
      { label: "Abbastanza", value: 2 },
      { label: "Non molto", value: 1 },
      { label: "Per nulla", value: 0 },
    ],
  },
  {
    number: 12,
    text: "Non vedo l’ora di fare le cose",
    options: [
      { label: "Come ho sempre fatto", value: 0 },
      { label: "Piuttosto meno di prima", value: 1 },
      { label: "Decisamente meno di prima", value: 2 },
      { label: "Per nulla", value: 3 },
    ],
  },
  {
    number: 13,
    text: "Mi vengono improvvise sensazioni di panico",
    options: [
      { label: "Molto spesso", value: 3 },
      { label: "Abbastanza spesso", value: 2 },
      { label: "Non molto spesso", value: 1 },
      { label: "Per nulla", value: 0 },
    ],
  },
  {
    number: 14,
    text: "Riesco a provare piacere nel leggere un buon libro o nel guardare un buon programma alla TV",
    options: [
      { label: "Spesso", value: 0 },
      { label: "Qualche volta", value: 1 },
      { label: "Raramente", value: 2 },
      { label: "Molto raramente", value: 3 },
    ],
  },
];

// Build Question[] for your renderer
const questions: Question[] = QUESTIONS.map(
  (q) =>
    ({
      key: `q${q.number}`,
      number: q.number,
      text: q.text,
      type: "single_choice",
      required: true,
      options: q.options.map((o) => ({ ...o })),
    }) satisfies Question,
);

export const HADS_SELF: QuestionnaireDef = {
  code: "HADS_SELF",
  formCode: "HADS_SELF",
  type: "SELF",
  name: "HADS_SELF",
  instruction:
    "Le domande seguenti riguardano come si è sentito/a nell’ultima settimana. Per favore scelga la risposta che descrive meglio come si è sentito/a. Non ci sono risposte giuste o sbagliate.",
  questions,
};

// ===============================
// SCORING HELPERS
// ===============================

function stripUiSuffix(v: unknown) {
  if (typeof v !== "string") return v;
  return v.split("__")[0].trim();
}

// label->score map per item (robust when UI sends only label)
const LABEL_SCORE_MAP: Record<
  number,
  Record<string, number>
> = Object.fromEntries(
  QUESTIONS.map((q) => [
    q.number,
    Object.fromEntries(
      q.options.map((o) => [o.label.trim().toLowerCase(), o.value]),
    ),
  ]),
);

function toScore(ans: any, qNumber: number): number {
  if (ans == null) return 0;

  // number
  if (typeof ans === "number") return Number.isFinite(ans) ? ans : 0;

  // string: could be "2__0" or "Molto spesso__0" etc
  if (typeof ans === "string") {
    const s0 = String(stripUiSuffix(ans)).trim();
    const n = Number(s0);
    if (!Number.isNaN(n) && Number.isFinite(n)) return n;

    const byLabel = LABEL_SCORE_MAP[qNumber]?.[s0.toLowerCase()];
    return typeof byLabel === "number" ? byLabel : 0;
  }

  // object: {value}, {id}, {label}
  if (typeof ans === "object") {
    const val = (ans as any).value ?? (ans as any).id ?? null;
    if (val != null) {
      const v0 = stripUiSuffix(val);
      const n = Number(v0);
      if (!Number.isNaN(n) && Number.isFinite(n)) return n;
    }

    const lab = (ans as any).label ?? null;
    if (lab != null) {
      const s0 = String(stripUiSuffix(lab)).trim().toLowerCase();
      const byLabel = LABEL_SCORE_MAP[qNumber]?.[s0];
      return typeof byLabel === "number" ? byLabel : 0;
    }
  }

  return 0;
}

// ===============================
// COMPUTE
// ===============================

export type ComputeCtx = {}; // no ctx needed

const HADS_A_ITEMS = [1, 3, 5, 7, 9, 11, 13];
const HADS_D_ITEMS = [2, 4, 6, 8, 10, 12, 14];

function esitoFromPg(pg: number): Esito {
  if (pg >= 15) return "disturbo grave";
  if (pg >= 11) return "disturbo moderato";
  if (pg >= 8) return "disturbo lieve";
  return "";
}

export function computeHADSSelf(
  answers: Record<string, any>,
  _ctx?: ComputeCtx,
) {
  // Score items 1..14
  const itemScores: number[] = [];
  for (let i = 1; i <= 14; i++) {
    // If your toScore is (ans) only, change this line accordingly (see note below)
    itemScores[i] = toScore(answers[qKey(i)], i);
  }

  const hadsA = HADS_A_ITEMS.reduce((sum, i) => sum + (itemScores[i] ?? 0), 0);
  const hadsD = HADS_D_ITEMS.reduce((sum, i) => sum + (itemScores[i] ?? 0), 0);

  return {
    "HADS-A PG": String(hadsA),
    "HADS-A ESITO": esitoFromPg(hadsA),

    "HADS-D PG": String(hadsD),
    "HADS-D ESITO": esitoFromPg(hadsD),
  };
}
