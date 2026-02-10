import type { QuestionnaireDef, Question } from "../types";
import { qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF (EQ-40)
// ===============================

const OPTION_LABELS = [
  "Totalmente d'accordo",
  "Parzialmente d'accordo",
  "Parzialmente in disaccordo",
  "Totalmente in disaccordo",
] as const;

/**
 * Keep option `value` as stable index (0..3).
 * Real scoring differs per item, handled in SCORING_MATRIX.
 */
const OPTIONS = OPTION_LABELS.map((label, idx) => ({
  label,
  value: idx,
}));

const QUESTIONS_1_40: string[] = [
  "Capisco con facilità se qualcuno vuole partecipare ad una conversazione.",
  "Trovo difficile spiegare agli altri concetti che io comprendo facilmente, quando loro non capiscono alla prima spiegazione.",
  "Prendermi cura degli altri è qualcosa che mi fa veramente piacere.",
  "Trovo difficile prevedere ciò che qualcun altro potrebbe fare.",
  "Trovo che sia difficile mettermi nei panni degli altri.",
  "Di solito resto coinvolto emotivamente nei problemi dei miei amici.",
  "Riesco con facilità a capire cosa qualcuno vuole parlare.",
  "Tendo a farmi coinvolgere troppo emotivamente dai problemi degli altri.",
  "Trovo che sia difficile comprendere l’intenzione di qualcuno se questo o questa parla in modo indiretto.",
  "Quando incontro nuove persone, spesso noto subito che tipo di persone sono.",
  "Spesso resto coinvolto emotivamente in una storia di un film.",
  "Mi fa piacere vedere che qualcuno sta bene.",
  "Riesco con facilità a capire cosa qualcuno sta provando o pensando.",
  "Quando parlo con qualcuno, mi concentro sulla sua espressione facciale.",
  "Mi fa piacere aiutare gli altri.",
  "Quando parlo con qualcuno, mi concentro su ciò che lui o lei sta dicendo piuttosto che sulla sua espressione facciale.",
  "Posso facilmente distinguere se qualcuno è interessato o annoiato da ciò che sto dicendo.",
  "Posso facilmente intuire perché qualcuno si è sentito offeso.",
  "Trovo difficile capire perché qualcuno abbia paura di qualcosa.",
  "Posso facilmente capire come qualcuno stia provando solo guardandolo.",
  "Mi fa piacere capire come gli altri si sentano e pensino.",
  "Trovo difficile capire perché qualcuno si senta imbarazzato.",
  "Posso facilmente capire cosa qualcuno stia provando.",
  "Trovo difficile capire perché qualcuno si senta felice.",
  "Posso facilmente capire cosa qualcuno stia pensando o provando.",
  "Trovo che sia difficile capire perché qualcuno sia arrabbiato.",
  "Riesco con facilità a capire come qualcuno possa sentirsi in una determinata situazione.",
  "Posso facilmente capire perché qualcuno si senta felice.",
  "Trovo difficile capire perché qualcuno si senta triste.",
  "Riesco con facilità a capire perché qualcuno si senta triste.",
  "Trovo difficile capire perché qualcuno si senta nervoso.",
  "Posso facilmente capire perché qualcuno si senta nervoso.",
  "Trovo difficile capire perché qualcuno si senta colpevole.",
  "Posso facilmente capire perché qualcuno si senta colpevole.",
  "Trovo difficile capire perché qualcuno si senta orgoglioso.",
  "Posso facilmente capire perché qualcuno si senta orgoglioso.",
  "Trovo difficile capire perché qualcuno si senta invidioso.",
  "Posso facilmente capire perché qualcuno si senta invidioso.",
  "Trovo difficile capire perché qualcuno si senta sollevato.",
  "Di solito tengo in considerazione il punto di vista degli altri anche se non lo condivido.",
];

const questions: Question[] = QUESTIONS_1_40.map(
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

export const EQ40_SELF: QuestionnaireDef = {
  code: "EQ40_SELF",
  formCode: "EQ40_SELF",
  type: "SELF",
  name: "EQ40_SELF",
  instruction: `A seguire sono riportate una lista di affermazioni. Legga gentilmente ciascuna affermazione molto attentamente, indicando quanto fortemente è in accordo o in disaccordo con esse. Non ci sono risposte giuste o sbagliate, né risposte "a trabocchetto".`,
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito = "sintomatico" | "";

/**
 * Per-item scoring (from template):
 * Columns correspond to OPTION_LABELS order:
 * [Totalmente d'accordo, Parzialmente d'accordo, Parzialmente in disaccordo, Totalmente in disaccordo]
 */
const SCORING_MATRIX: number[][] = [
  [2, 1, 0, 0], // 1
  [0, 0, 1, 2], // 2
  [2, 1, 0, 0], // 3
  [0, 0, 1, 2], // 4
  [0, 0, 1, 2], // 5
  [0, 0, 1, 2], // 6
  [0, 0, 1, 2], // 7
  [0, 0, 1, 2], // 8
  [0, 0, 1, 2], // 9
  [2, 1, 0, 0], // 10
  [2, 1, 0, 0], // 11
  [2, 1, 0, 0], // 12
  [2, 1, 0, 0], // 13
  [2, 1, 0, 0], // 14
  [2, 1, 0, 0], // 15
  [0, 0, 1, 2], // 16
  [2, 1, 0, 0], // 17
  [0, 0, 1, 2], // 18
  [0, 0, 1, 2], // 19
  [2, 1, 0, 0], // 20
  [2, 1, 0, 0], // 21
  [0, 0, 1, 2], // 22
  [2, 1, 0, 0], // 23
  [0, 0, 1, 2], // 24
  [2, 1, 0, 0], // 25
  [0, 0, 1, 2], // 26
  [2, 1, 0, 0], // 27
  [2, 1, 0, 0], // 28
  [0, 0, 1, 2], // 29
  [2, 1, 0, 0], // 30
  [0, 0, 1, 2], // 31
  [2, 1, 0, 0], // 32
  [0, 0, 1, 2], // 33
  [2, 1, 0, 0], // 34
  [0, 0, 1, 2], // 35
  [2, 1, 0, 0], // 36
  [0, 0, 1, 2], // 37
  [2, 1, 0, 0], // 38
  [0, 0, 1, 2], // 39
  [2, 1, 0, 0], // 40
];

/**
 * UI sometimes sends:
 * - "Totalmente d'accordo__0"
 * - "0__0" / "1__0"
 * - { label: "Totalmente d'accordo" }
 * - { value: 0 } / { id: 0 }
 * - 0
 */
function stripUiSuffix(v: unknown) {
  if (typeof v !== "string") return v;
  return v.split("__")[0].trim();
}

function labelToIndex(label: string): number {
  const s = label.trim().toLowerCase();
  return OPTION_LABELS.findIndex((x) => x.toLowerCase() === s);
}

function toChoiceIndex(ans: any): number | null {
  if (ans == null) return null;

  // number
  if (typeof ans === "number" && Number.isFinite(ans)) {
    const n = ans;
    // common cases: 0..3 (index) or 1..4 (index+1)
    if (n >= 0 && n <= 3) return n;
    if (n >= 1 && n <= 4) return n - 1;
    return null;
  }

  // string
  if (typeof ans === "string") {
    const s0 = String(stripUiSuffix(ans));
    const n = Number(s0);
    if (!Number.isNaN(n) && Number.isFinite(n)) {
      if (n >= 0 && n <= 3) return n;
      if (n >= 1 && n <= 4) return n - 1;
      return null;
    }
    const idx = labelToIndex(s0);
    return idx >= 0 ? idx : null;
  }

  // object
  if (typeof ans === "object") {
    const val = (ans as any).value ?? (ans as any).id ?? null;
    if (val != null) {
      const v0 = stripUiSuffix(val);
      const n = Number(v0);
      if (!Number.isNaN(n) && Number.isFinite(n)) {
        if (n >= 0 && n <= 3) return n;
        if (n >= 1 && n <= 4) return n - 1;
      }
    }

    const lab = (ans as any).label ?? null;
    if (lab != null) {
      const idx = labelToIndex(String(stripUiSuffix(lab)));
      return idx >= 0 ? idx : null;
    }
  }

  return null;
}

function toScore(ans: any, questionNumber: number): number {
  const idx = toChoiceIndex(ans);
  if (idx == null) return 0;

  const row = SCORING_MATRIX[questionNumber - 1];
  if (!row) return 0;

  const score = row[idx];
  return Number.isFinite(score) ? score : 0;
}

// ===============================
// COMPUTE
// ===============================

export function computeEQ40Self(answers: Record<string, any>) {
  const scores: number[] = [];
  for (let i = 1; i <= 40; i++) {
    scores.push(toScore(answers[qKey(i)], i));
  }

  // EQ-40 totale: sum of all items
  const eq40_totale = scores.reduce((a, b) => a + b, 0);

  // Template rule: if PG ≥ 30 write "sintomatico"
  const esito: Esito = eq40_totale >= 30 ? "sintomatico" : "";

  return {
    "EQ-40 totale PG": String(eq40_totale),
    "EQ-40 totale ESITO": esito,
  };
}
