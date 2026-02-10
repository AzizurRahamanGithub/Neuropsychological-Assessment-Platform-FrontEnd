import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS = [
  { label: "Meno del solito", value: 0 },
  { label: "Non più del solito", value: 1 },
  { label: "Più del solito", value: 2 },
  { label: "Molto più del solito", value: 3 },
] as const;

const QUESTIONS_1_11: string[] = [
  "Ha problemi di stanchezza?",
  "Sente il bisogno di riposare di più?",
  "Si sente addormentato o assonato?",
  "Ha problemi ad iniziare le cose?",
  "Sente che le manca energia?",
  "Sente che ha meno forza nei muscoli?",
  "Si sente debole?",
  "Ha difficoltà a concentrarsi?",
  "Le capita di sbagliare le parole quando parla?",
  "Trova più difficile trovare la parola corretta?",
  "Ha problemi di memoria?",
];

const questions: Question[] = QUESTIONS_1_11.map(
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

export const CFQ11_SELF: QuestionnaireDef = {
  code: "CFQ11_SELF",
  formCode: "CFQ11_SELF",
  type: "SELF",
  name: "CFQ_11_SELF",
  instruction:
    "Questo questionario mira ad ottenere maggiori informazioni riguardo ad eventuali difficoltà da Lei sperimentate in relazione a sensazioni di stanchezza, debolezza o mancanza di energia nell'ultimo mese. Le si chiede pertanto di rispondere a TUTTE le domande, selezionando l'opzione che meglio La rappresenta. Qualora la sensazione di stanchezza sia presente da molto tempo, faccia riferimento all'ultima volta che si è sentito bene.",
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito = "sintomatico" | "";

/**
 * UI sometimes sends:
 * - "Meno del solito__0"
 * - "0__0"
 * - { label: "Meno del solito" }
 * - { value: 0 } / { id: 0 }
 * - 0
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

// ===============================
// COMPUTE
// ===============================

export function computeCFQ11Self(answers: Record<string, any>) {
  // Get scores for all 11 questions
  const scores: number[] = [];
  for (let i = 1; i <= 11; i++) {
    scores.push(toScore(answers[qKey(i)]));
  }

  // Fatica fisica: items 1-7 (questions 1,2,3,4,5,6,7)
  const fatica_fisica_items = [1, 2, 3, 4, 5, 6, 7];
  const fatica_fisica_punteggio = fatica_fisica_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Fatica psicologica: items 8-11 (questions 8,9,10,11)
  const fatica_psicologica_items = [8, 9, 10, 11];
  const fatica_psicologica_punteggio = fatica_psicologica_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Scala totale: sum of all items
  const scala_totale = scores.reduce((a, b) => a + b, 0);

  // Determine ESITO based on thresholds
  function getEsito(score: number, threshold: number): Esito {
    if (score >= threshold) return "sintomatico";
    return "";
  }

  // Note: Subscales use "*" marker in Excel, using "sintomatico" for consistency
  function getSubscaleEsito(score: number, threshold: number): string {
    if (score >= threshold) return "*";
    return "";
  }

  return {
    // Main scale
    "Scala totale PG": String(scala_totale),
    "Scala totale ESITO": getEsito(scala_totale, 11),

    // Subscales
    "Fatica fisica PG": String(fatica_fisica_punteggio),
    "Fatica fisica ESITO": getSubscaleEsito(fatica_fisica_punteggio, 7),

    "Fatica psicologica PG": String(fatica_psicologica_punteggio),
    "Fatica psicologica ESITO": getSubscaleEsito(
      fatica_psicologica_punteggio,
      4,
    ),
  };
}
