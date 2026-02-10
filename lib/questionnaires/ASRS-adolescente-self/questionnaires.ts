import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS = [
  { label: "Mai", value: 0 },
  { label: "Raramente", value: 1 },
  { label: "Qualche volta", value: 2 },
  { label: "Spesso", value: 3 },
  { label: "Molto Spesso", value: 4 },
] as const;

const QUESTIONS_1_18: string[] = [
  "Con che frequenza ha difficoltà a concludere i dettagli finali di un progetto, una volta che le parti più stimolanti sono state fatte?",
  "Con che frequenza ha difficoltà a mettere le cose in ordine quando deve svolgere un compito che richiede organizzazione?",
  "Con che frequenza ha problemi a ricordarsi gli appuntamenti o gli impegni?",
  "Quando ha un compito che richiede un sacco di concentrazione, con che frequenza evita o ritarda l'inizio?",
  "Con che frequenza agita o si contorce le mani o i piedi quando deve stare seduto/a per molto tempo?",
  "Con che frequenza si sente eccessivamente attivo/a e costretto a fare delle cose, come se fosse azionato/a da un motore?",
  "Con che frequenza fa errori di distrazione quando deve lavorare ad un progetto noioso o difficile?",
  "Con che frequenza ha difficoltà a mantenere la sua attenzione quando sta svolgendo un compito noioso o ripetitivo?",
  "Con che frequenza ha difficoltà a concentrarsi su quello che le persone le dicono, anche quando stanno parlando a lei direttamente?",
  "Con che frequenza perde o ha difficoltà a trovare le cose a casa o al lavoro?",
  "Con che frequenza è distratto dalle attività o dal rumore attorno a lei?",
  "Con che frequenza abbandona il suo posto nelle riunioni o in altre situazioni in cui si aspetta che lei resti seduto/a?",
  "Con che frequenza si sente agitato/a o irrequieto/a?",
  "Con che frequenza ha difficoltà a staccare e a rilassarsi quando ha tempo per sé?",
  "Con che frequenza si trova a parlare troppo quando è nelle situazioni sociali?",
  "Durante conversazione, con che frequenza si trova a terminare le frasi delle persone con cui sta parlando, prima che possano finirle da sole?",
  "Con che frequenza ha difficoltà ad attendere il suo turno nelle situazioni in cui si richiede di aspettare il proprio turno?",
  "Con che frequenza interrompe gli altri quando sono indaffarati?",
];

const questions: Question[] = QUESTIONS_1_18.map(
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

export const ASRS_ADOLESCENTE_SELF: QuestionnaireDef = {
  code: "ASRS_ADOLESCENTE_SELF",
  formCode: "ASRS_ADOLESCENTE_SELF",
  type: "SELF",
  name: "ASRS_ADOLESCENTE_SELF",
  instruction:
    "Selezioni gentilmente la risposta che meglio descrive come si è sentito e comportato negli ultimi 6 mesi.",
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito = "sintomatico" | "";

/**
 * UI sometimes sends:
 * - "Mai__0"
 * - "0__0"
 * - { label: "Mai" }
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

export function computeASRSAdolescenteSelf(answers: Record<string, any>) {
  // Questions 1-18
  const scores: number[] = [];
  for (let i = 1; i <= 18; i++) {
    scores.push(toScore(answers[qKey(i)]));
  }

  // Total score (all 18 items)
  const totale_punteggio = scores.reduce((a, b) => a + b, 0);

  // Disattenzione: items 1, 2, 3, 4, 7, 8, 9, 10, 11
  // (questions 1, 2, 3, 4, 7, 8, 9, 10, 11)
  const disattenzione_items = [1, 2, 3, 4, 7, 8, 9, 10, 11];
  const disattenzione_punteggio = disattenzione_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Iperattività/Impulsività: items 5, 6, 12, 13, 14, 15, 16, 17, 18
  // (questions 5, 6, 12, 13, 14, 15, 16, 17, 18)
  const iperattivita_items = [5, 6, 12, 13, 14, 15, 16, 17, 18];
  const iperattivita_punteggio = iperattivita_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Determine ESITO based on thresholds
  const totale_esito: Esito = totale_punteggio >= 31 ? "sintomatico" : "";
  const disattenzione_esito: Esito =
    disattenzione_punteggio >= 16 ? ("*" as any) : "";
  const iperattivita_esito: Esito =
    iperattivita_punteggio >= 16 ? ("*" as any) : "";

  return {
    "Scala totale PG": String(totale_punteggio),
    "Scala totale ESITO": totale_esito,

    "Disattenzione PG": String(disattenzione_punteggio),
    "Disattenzione ESITO": disattenzione_esito,

    "Iperattività/Impulsività PG": String(iperattivita_punteggio),
    "Iperattività/Impulsività ESITO": iperattivita_esito,
  };
}
