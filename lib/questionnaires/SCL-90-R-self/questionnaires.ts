import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS = [
  { label: "Per niente", value: 1 },
  { label: "Poco", value: 2 },
  { label: "Moderatamente", value: 3 },
  { label: "Molto", value: 4 },
  { label: "Moltissimo", value: 5 },
] as const;

const QUESTIONS_1_90: string[] = [
  "Mal di testa",
  "Nervosismo o agitazione interna",
  "Pensieri sgradevoli che si ripetono",
  "Sensazione di svenimento o di vertigine",
  "Perdita dell'interesse o del piacere sessuale",
  "Tendenza a criticare gli altri",
  "Convinzione che qualcun altro possa controllare i suoi pensieri",
  "Sensazione che gli altri siano responsabili della maggior parte dei suoi problemi",
  "Difficoltà a ricordare le cose",
  "Preoccupazioni per la sua negligenza o trascuratezza",
  "Sentirsi facilmente infastidito o irritato",
  "Dolori al cuore o al petto",
  "Paura degli spazi aperti o delle strade",
  "Sentirsi debole o fiacco",
  "Idee di togliersi la vita",
  "Udire voci che le altre persone non odono",
  "Tremori",
  "Sensazione di non potersi fidare della maggior parte delle persone",
  "Scarso appetito",
  "Facilità al pianto",
  "Sentirsi intimidito o a disagio con l'altro sesso",
  "Sensazione di essere preso in trappola",
  "Paure improvvise senza ragione",
  "Scatti di ira incontrollabili",
  "Paura di uscire di casa da solo",
  "Attribuirsi la colpa di tutto",
  "Dolori alla bassa schiena",
  "Senso di incapacità a portare a termine le cose",
  "Sentirsi solo",
  "Sentirsi giù di morale",
  "Preoccuparsi eccessivamente per qualsiasi cosa",
  "Mancanza di interesse",
  "Senso di paura",
  "Sentirsi facilmente ferito o offeso",
  "Convinzione che gli altri percepiscano i suoi pensieri",
  "Sensazione di non trovare comprensione o simpatia",
  "Sensazione che gli altri le siano ostili o la abbiano in antipatia",
  "Dover fare le cose molto lentamente",
  "Palpitazioni o sentirsi il cuore in gola",
  "Senso di nausea o mal di stomaco",
  "Sentirsi inferiore agli altri",
  "Dolori muscolari",
  "Sensazione che gli altri la osservino o parlino di lei",
  "Difficoltà ad addormentarsi",
  "Bisogno di controllare ripetutamente ciò che fa",
  "Difficoltà a prendere decisioni",
  "Paura di viaggiare in autobus, in metropolitana o in treno",
  "Sentirsi senza fiato",
  "Vampate di calore o brividi di freddo",
  "Necessità di evitare certi oggetti, luoghi o attività perché la spaventano",
  "Senso di vuoto mentale",
  "Intorpidimento o formicolio di alcune parti del corpo",
  "Nodo alla gola",
  "Guardare al futuro senza speranza",
  "Difficoltà a concentrarsi",
  "Senso di debolezza in qualche parte del corpo",
  "Sentirsi teso o sulle spine",
  "Senso di pesantezza alle braccia o alle gambe",
  "Idee di morte o di morire",
  "Mangiare troppo",
  "Senso di disagio quando la gente la guarda o parla di lei",
  "Avere dei pensieri che non sono suoi",
  "Sentire l'impulso di colpire, ferire o fare male a qualcuno",
  "Svegliarsi presto al mattino",
  "Avere bisogno di ripetere lo stesso atto come toccare, contare, lavarsi le mani, ecc.",
  "Sonno inquieto o disturbato",
  "Sentire l'impulso di rompere o spaccare oggetti",
  "Avere idee o credenze che gli altri non condividono",
  "Sentirsi penosamente imbarazzato in presenza di altri",
  "Sentirsi a disagio tra la folla come nei negozi, al cinema, ecc.",
  "Sensazione che tutto richieda uno sforzo",
  "Momenti di terrore e di panico",
  "Sentirsi a disagio quando mangia o beve in presenza di altri",
  "Ingaggiare frequenti discussioni",
  "Sentirsi a disagio quando è solo",
  "Idea che gli altri non apprezzino nella giusta misura i suoi successi",
  "Sentirsi solo e triste anche in compagnia",
  "Senso di irrequietezza tanto da non potere stare seduto tranquillo",
  "Sentimenti di inutilità",
  "Presentimento che debba accaderle qualcosa di spiacevole",
  "Urlare o scagliare oggetti",
  "Avere paura di svenire davanti agli altri",
  "Impressione che gli altri possano approfittare di lei, se lei glielo permette",
  "Pensieri sul sesso che la affliggono",
  "Idea di dover scontare i propri peccati",
  "Pensieri e immagini di natura spaventosa",
  "Pensiero di avere una grave malattia fisica",
  "Non sentirsi mai vicino alle altre persone",
  "Sentirsi in colpa",
  "Idea che qualche cosa non vada bene nella sua mente",
];

const questions: Question[] = QUESTIONS_1_90.map(
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

export const SCL90R_SELF: QuestionnaireDef = {
  code: "SCL90R_SELF",
  formCode: "SCL90R_SELF",
  type: "SELF",
  name: "SCL90R_SELF",
  instruction:
    "Qui di seguito le verranno proposti alcuni problemi che possono talvolta affliggere le persone. Le si chiede gentilmente di leggere con attenzione ciascuna affermazione, indicando CON QUALE INTENSITÀ NE HA SOFFERTO NEGLI ULTIMI 7 GIORNI, OGGI COMPRESO. In questo test non ci sono risposte giuste o sbagliate; ognuno di noi presenta un quadro peculiare di problemi e difficoltà. Risponda pertanto con la massima sincerità, prestando attenzione a non tralasciare alcuna risposta.",
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

function toScore(ans: any): number {
  if (ans == null) return 0;

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

  return rawScore;
}

// ===============================
// COMPUTE
// ===============================

export type ComputeCtx = {
  patientSex?: string | null; // ✅ new preferred
  patientGender?: string | null; // ✅ keep old support
};

type Sex = "M" | "F" | null;

function normalizeSex(v: unknown): Sex {
  if (!v) return null;
  const s = String(v).trim().toUpperCase();
  if (s === "F" || s === "FEMALE") return "F";
  if (s === "M" || s === "MALE") return "M";
  return null;
}

function getEsito(
  pg: number,
  sex: Sex,
  maleLimits: [number, number, number],
  femaleLimits: [number, number, number],
): Esito {
  const [limiteMin, sintomaticoMin, forteSintomaticoMin] =
    sex === "F" ? femaleLimits : maleLimits;

  if (pg >= forteSintomaticoMin) return "fortemente sintomatico";
  if (pg >= sintomaticoMin) return "sintomatico";
  if (pg >= limiteMin) return "limite";
  return "";
}

function getEsitoSingle(
  pg: number,
  limiteVal: number,
  sintomaticoVal: number,
  forteVal: number,
): Esito {
  if (pg >= forteVal) return "fortemente sintomatico";
  if (pg >= sintomaticoVal) return "sintomatico";
  if (pg >= limiteVal) return "limite";
  return "";
}

export function computeSCL90RSelf(
  answers: Record<string, any>,
  ctx?: ComputeCtx,
) {
  // Get scores for all 90 questions
  const scores: number[] = [];
  for (let i = 1; i <= 90; i++) {
    scores.push(toScore(answers[qKey(i)]));
  }

  const sex = normalizeSex(ctx?.patientSex ?? ctx?.patientGender);
  const genderUsed = sex === "F" ? "FEMALE" : sex === "M" ? "MALE" : "";

  // Somatizzazione: avg of items 1,4,12,27,40,42,48,49,52,53,56,58
  const som_items = [1, 4, 12, 27, 40, 42, 48, 49, 52, 53, 56, 58];
  const som_avg =
    som_items.reduce((sum, i) => sum + scores[i - 1], 0) / som_items.length;
  const som_esito = getEsito(som_avg, sex, [2.0, 2.3, 2.4], [2.4, 2.85, 3.1]);

  // Ossessività-compulsività: avg of items 3,9,10,28,38,45,46,51,55,65
  const ocd_items = [3, 9, 10, 28, 38, 45, 46, 51, 55, 65];
  const ocd_avg =
    ocd_items.reduce((sum, i) => sum + scores[i - 1], 0) / ocd_items.length;
  const ocd_esito = getEsito(ocd_avg, sex, [2.3, 2.7, 2.85], [2.4, 2.85, 3.1]);

  // Sensibilità interpersonale: avg of items 6,21,34,36,37,41,61,69,73
  const sens_items = [6, 21, 34, 36, 37, 41, 61, 69, 73];
  const sens_avg =
    sens_items.reduce((sum, i) => sum + scores[i - 1], 0) / sens_items.length;
  const sens_esito = getEsito(sens_avg, sex, [2.0, 2.3, 2.4], [2.2, 2.6, 2.8]);

  // Depressione: avg of items 5,14,15,20,22,26,29,30,31,32,54,71,79
  const dep_items = [5, 14, 15, 20, 22, 26, 29, 30, 31, 32, 54, 71, 79];
  const dep_avg =
    dep_items.reduce((sum, i) => sum + scores[i - 1], 0) / dep_items.length;
  const dep_esito = getEsito(dep_avg, sex, [2.0, 2.3, 2.4], [2.4, 2.8, 3.0]);

  // Ansia: avg of items 2,17,23,33,39,57,72,78,80,86
  const anx_items = [2, 17, 23, 33, 39, 57, 72, 78, 80, 86];
  const anx_avg =
    anx_items.reduce((sum, i) => sum + scores[i - 1], 0) / anx_items.length;
  const anx_esito = getEsito(anx_avg, sex, [1.9, 2.1, 2.2], [2.2, 2.6, 2.7]);

  // Ostilità: avg of items 11,24,63,67,74,81
  const host_items = [11, 24, 63, 67, 74, 81];
  const host_avg =
    host_items.reduce((sum, i) => sum + scores[i - 1], 0) / host_items.length;
  const host_esito = getEsito(host_avg, sex, [2.1, 2.45, 2.6], [2.2, 2.6, 2.7]);

  // Ansia fobica: avg of items 13,25,47,50,70,75,82
  const phob_items = [13, 25, 47, 50, 70, 75, 82];
  const phob_avg =
    phob_items.reduce((sum, i) => sum + scores[i - 1], 0) / phob_items.length;
  const phob_esito = getEsito(phob_avg, sex, [1.4, 1.6, 1.7], [1.6, 1.9, 2.0]);

  // Ideazione paranoide: avg of items 8,18,43,68,76,83
  const par_items = [8, 18, 43, 68, 76, 83];
  const par_avg =
    par_items.reduce((sum, i) => sum + scores[i - 1], 0) / par_items.length;
  const par_esito = getEsito(par_avg, sex, [2.3, 2.7, 2.9], [2.4, 2.8, 3.0]);

  // Psicoticismo: avg of items 7,16,35,62,77,84,85,87,88,90
  const psy_items = [7, 16, 35, 62, 77, 84, 85, 87, 88, 90];
  const psy_avg =
    psy_items.reduce((sum, i) => sum + scores[i - 1], 0) / psy_items.length;
  const psy_esito = getEsito(psy_avg, sex, [1.7, 1.9, 2.0], [1.8, 2.0, 2.2]);

  // Disturbi del sonno: avg of items 44,64,66
  const sleep_items = [44, 64, 66];
  const sleep_avg =
    sleep_items.reduce((sum, i) => sum + scores[i - 1], 0) / sleep_items.length;
  const sleep_esito = getEsito(
    sleep_avg,
    sex,
    [2.2, 2.6, 2.7],
    [2.2, 2.6, 2.7],
  );

  // Single item scales (same thresholds for both genders: 3=limite, 4=sintomatico, 5=forte)
  const appetito_scarso = scores[19 - 1]; // item 19
  const appetito_scarso_esito = getEsitoSingle(appetito_scarso, 3, 4, 5);

  const appetito_abbondante = scores[60 - 1]; // item 60
  const appetito_abbondante_esito = getEsitoSingle(
    appetito_abbondante,
    3,
    4,
    5,
  );

  const senso_colpa = scores[89 - 1]; // item 89
  const senso_colpa_esito = getEsitoSingle(senso_colpa, 3, 4, 5);

  const idee_morte = scores[59 - 1]; // item 59
  const idee_morte_esito = getEsitoSingle(idee_morte, 3, 4, 5);

  return {
    "Somatizzazione PG": som_avg.toFixed(2),
    "Somatizzazione CUTOFF": sex === "F" ? "≥2.85" : "≥2.30",
    "Somatizzazione ESITO": som_esito,

    "Ossessività-compulsività PG": ocd_avg.toFixed(2),
    "Ossessività-compulsività CUTOFF": sex === "F" ? "≥2.85" : "≥2.30",
    "Ossessività-compulsività ESITO": ocd_esito,

    "Sensibilità interpersonale PG": sens_avg.toFixed(2),
    "Sensibilità interpersonale CUTOFF": sex === "F" ? "≥2.60" : "≥2.30",
    "Sensibilità interpersonale ESITO": sens_esito,

    "Depressione PG": dep_avg.toFixed(2),
    "Depressione CUTOFF": sex === "F" ? "≥2.80" : "≥2.30",
    "Depressione ESITO": dep_esito,

    "Ansia PG": anx_avg.toFixed(2),
    "Ansia CUTOFF": sex === "F" ? "≥2.60" : "≥2.10",
    "Ansia ESITO": anx_esito,

    "Ostilità PG": host_avg.toFixed(2),
    "Ostilità CUTOFF": sex === "F" ? "≥2.60" : "≥2.45",
    "Ostilità ESITO": host_esito,

    "Ansia fobica PG": phob_avg.toFixed(2),
    "Ansia fobica CUTOFF": sex === "F" ? "≥1.90" : "≥1.60",
    "Ansia fobica ESITO": phob_esito,

    "Ideazione paranoide PG": par_avg.toFixed(2),
    "Ideazione paranoide CUTOFF": sex === "F" ? "≥2.80" : "≥2.70",
    "Ideazione paranoide ESITO": par_esito,

    "Psicoticismo PG": psy_avg.toFixed(2),
    "Psicoticismo CUTOFF": sex === "F" ? "≥2.00" : "≥1.90",
    "Psicoticismo ESITO": psy_esito,

    "Disturbi del sonno PG": sleep_avg.toFixed(2),
    "Disturbi del sonno CUTOFF": "≥2.60",
    "Disturbi del sonno ESITO": sleep_esito,

    "Appetito scarso PG": String(appetito_scarso),
    "Appetito scarso CUTOFF": "≥4",
    "Appetito scarso ESITO": appetito_scarso_esito,

    "Appetito abbondante PG": String(appetito_abbondante),
    "Appetito abbondante CUTOFF": "≥4",
    "Appetito abbondante ESITO": appetito_abbondante_esito,

    "Senso di colpa PG": String(senso_colpa),
    "Senso di colpa CUTOFF": "≥4",
    "Senso di colpa ESITO": senso_colpa_esito,

    "Idee di morte o di morire PG": String(idee_morte),
    "Idee di morte o di morire CUTOFF": "≥4",
    "Idee di morte o di morire ESITO": idee_morte_esito,

    "Gender used": genderUsed,
  };
}
