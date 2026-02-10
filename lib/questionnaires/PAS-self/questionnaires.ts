import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS = [
  { label: "Per niente vero", value: 0 },
  { label: "Poco vero", value: 1 },
  { label: "Quasi vero", value: 2 },
  { label: "Assolutamente vero", value: 3 },
] as const;

const QUESTIONS_1_22: string[] = [
  "I miei amici sono disponibili se ho bisogno di loro.",
  "Sono una persona molto socievole.",
  "Sono un tipo di persona che si fa carico delle situazioni.",
  "A volte lascio che piccole cose mi diano un po' troppo fastidio.",
  "Ho pensato a vari modi per togliermi la vita.",
  "Spesso mi è difficile divertirmi perché mi preoccupo troppo.",
  "Alcune persone fanno in modo di farmi fare brutta figura.",
  "Ho fatto alcune cose che non erano del tutto legali.",
  "Con i problemi di salute che ho, fare le cose per me è una lotta.",
  "Le persone che mi stanno attorno mi sono fedeli.",
  "Godo di buona salute.",
  "Il bere sembra crearmi problemi nelle relazioni con gli altri.",
  "Non uso mai sostanze illegali.",
  "Alcune persone cercano d'intralciare il mio successo.",
  "Ho pensato al suicidio per molto tempo.",
  "Ho un brutto carattere.",
  "Ci vuole un bel po' prima di farmi arrabbiare.",
  "Spendo soldi troppo facilmente.",
  "Faccio amicizia facilmente.",
  "Sono quasi sempre una persona positiva e felice.",
  "Non guido mai se ho bevuto.",
  "Gli altri mi ritengono aggressivo/a.",
];

// Reverse-scored items (items where higher response = lower pathology)
// Items 1, 2, 10, 11, 13, 17, 19, 20, 21 are reverse scored (3→0, 2→1, 1→2, 0→3)
const REVERSE_ITEMS: number[] = [1, 2, 10, 11, 13, 17, 19, 20, 21];

const questions: Question[] = QUESTIONS_1_22.map(
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

export const PAS_SELF: QuestionnaireDef = {
  code: "PAS_SELF",
  formCode: "PAS_SELF",
  type: "SELF",
  name: "PAS_SELF",
  instruction:
    "Legga ogni affermazione e valuti quanto ognuna di esse è accurata riguardo a Lei stesso. Risponda ad ogni affermazione.",
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito = "sintomatico" | "limite" | "";

/**
 * UI sometimes sends:
 * - "Per niente vero__0"
 * - "0__0"
 * - { label: "Per niente vero" }
 * - { value: 0 } / { id: 0 }
 * - 0
 */
function stripUiSuffix(v: unknown) {
  if (typeof v !== "string") return v;
  return v.split("__")[0].trim();
}

function toScore(ans: any, questionNumber: number): number {
  if (ans == null) return 0;

  // Determine if this question needs reverse scoring
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

export function computePASSelf(answers: Record<string, any>) {
  // Get scores for all 22 questions
  const scores: number[] = [];
  for (let i = 1; i <= 22; i++) {
    scores.push(toScore(answers[qKey(i)], i));
  }

  // Affettività negativa: items 4, 6, 20
  const affettivita_negativa_items = [4, 6, 20];
  const affettivita_negativa_punteggio = affettivita_negativa_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Acting out: items 8, 13, 18
  const acting_out_items = [8, 13, 18];
  const acting_out_punteggio = acting_out_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Problemi di salute: items 9, 11
  const problemi_salute_items = [9, 11];
  const problemi_salute_punteggio = problemi_salute_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Pensieri di sfiducia: items 7, 14
  const pensieri_sfiducia_items = [7, 14];
  const pensieri_sfiducia_punteggio = pensieri_sfiducia_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Ritiro sociale: items 2, 19
  const ritiro_sociale_items = [2, 19];
  const ritiro_sociale_punteggio = ritiro_sociale_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Controllo ostile: items 3, 22
  const controllo_ostile_items = [3, 22];
  const controllo_ostile_punteggio = controllo_ostile_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Pensieri negativi: items 5, 15
  const pensieri_negativi_items = [5, 15];
  const pensieri_negativi_punteggio = pensieri_negativi_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Alienazione: items 1, 10
  const alienazione_items = [1, 10];
  const alienazione_punteggio = alienazione_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Consumo di sostanze: items 12, 21
  const consumo_sostanze_items = [12, 21];
  const consumo_sostanze_punteggio = consumo_sostanze_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Controllo della rabbia: items 16, 17
  const controllo_rabbia_items = [16, 17];
  const controllo_rabbia_punteggio = controllo_rabbia_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Determine ESITO based on thresholds for each scale
  function getEsitoAffettivitaNegativa(score: number): Esito {
    if (score >= 6) return "sintomatico";
    if (score >= 4 && score <= 5) return "limite";
    return "";
  }

  function getEsitoActingOut(score: number): Esito {
    if (score >= 6) return "sintomatico";
    if (score >= 3 && score <= 5) return "limite";
    return "";
  }

  function getEsitoProblemiSalute(score: number): Esito {
    if (score >= 5) return "sintomatico";
    if (score >= 2 && score <= 4) return "limite";
    return "";
  }

  function getEsitoPensieriSfiducia(score: number): Esito {
    if (score >= 4) return "sintomatico";
    if (score >= 2 && score <= 3) return "limite";
    return "";
  }

  function getEsitoRitiroSociale(score: number): Esito {
    if (score >= 5) return "sintomatico";
    if (score >= 3 && score <= 4) return "limite";
    return "";
  }

  function getEsitoControlloOstile(score: number): Esito {
    if (score >= 5) return "sintomatico";
    if (score === 4) return "limite";
    return "";
  }

  function getEsitoPensieriNegativi(score: number): Esito {
    if (score >= 2) return "sintomatico";
    if (score === 1) return "limite";
    return "";
  }

  function getEsitoAlienazione(score: number): Esito {
    if (score >= 4) return "sintomatico";
    if (score === 3) return "limite";
    return "";
  }

  function getEsitoConsumoSostanze(score: number): Esito {
    if (score >= 4) return "sintomatico";
    if (score >= 2 && score <= 3) return "limite";
    return "";
  }

  function getEsitoControlloRabbia(score: number): Esito {
    if (score >= 4) return "sintomatico";
    if (score >= 2 && score <= 3) return "limite";
    return "";
  }

  return {
    // All subscales with PG and ESITO
    "Affettività negativa PG": String(affettivita_negativa_punteggio),
    "Affettività negativa ESITO": getEsitoAffettivitaNegativa(
      affettivita_negativa_punteggio,
    ),

    "Acting out PG": String(acting_out_punteggio),
    "Acting out ESITO": getEsitoActingOut(acting_out_punteggio),

    "Problemi di salute PG": String(problemi_salute_punteggio),
    "Problemi di salute ESITO": getEsitoProblemiSalute(
      problemi_salute_punteggio,
    ),

    "Pensieri di sfiducia PG": String(pensieri_sfiducia_punteggio),
    "Pensieri di sfiducia ESITO": getEsitoPensieriSfiducia(
      pensieri_sfiducia_punteggio,
    ),

    "Ritiro sociale PG": String(ritiro_sociale_punteggio),
    "Ritiro sociale ESITO": getEsitoRitiroSociale(ritiro_sociale_punteggio),

    "Controllo ostile PG": String(controllo_ostile_punteggio),
    "Controllo ostile ESITO": getEsitoControlloOstile(
      controllo_ostile_punteggio,
    ),

    "Pensieri negativi PG": String(pensieri_negativi_punteggio),
    "Pensieri negativi ESITO": getEsitoPensieriNegativi(
      pensieri_negativi_punteggio,
    ),

    "Alienazione PG": String(alienazione_punteggio),
    "Alienazione ESITO": getEsitoAlienazione(alienazione_punteggio),

    "Consumo di sostanze PG": String(consumo_sostanze_punteggio),
    "Consumo di sostanze ESITO": getEsitoConsumoSostanze(
      consumo_sostanze_punteggio,
    ),

    "Controllo della rabbia PG": String(controllo_rabbia_punteggio),
    "Controllo della rabbia ESITO": getEsitoControlloRabbia(
      controllo_rabbia_punteggio,
    ),
  };
}
