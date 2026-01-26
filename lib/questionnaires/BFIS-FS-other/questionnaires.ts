import type { QuestionnaireDef, Question } from "../types";
import { qKey } from "../utils";

const BFIS_OPTIONS = [
  { label: "0" },
  { label: "1" },
  { label: "2" },
  { label: "3" },
  { label: "4" },
  { label: "5" },
  { label: "6" },
  { label: "7" },
  { label: "8" },
  { label: "9" },
  { label: "NA" },
] as const;

const BFIS_ITEMS: string[] = [
  "Nella vita a casa con i suoi parenti stretti",
  "Nel portare a termine i doveri di casa e nel mandare avanti la sua famiglia",
  "Nel suo lavoro o occupazione",
  "Nelle sue interazioni sociali con gli estranei e con i conoscenti",
  "Nei suoi rapporti con gli amici",
  "Nelle sue attività di comunità",
  "In tutte le attività educative",
  "Nel suo rapporto coniugale o sentimentale",
  "Nella gestione del denaro",
  "Nella guida dell’automobile",
  "Nella sua attività sessuale",
  "Nella organizzazione e gestione delle responsabilità quotidiane",
  "Nel prendersi cura di se stesso/a",
  "Nel mantenimento della salute",
  "Nel prendersi cura dei figli",
];

const questions: Question[] = BFIS_ITEMS.map(
  (text, i) =>
    ({
      key: `q${i + 1}`,
      number: i + 1,
      text,
      type: "single_choice",
      required: true,
      options: [...BFIS_OPTIONS],
    }) satisfies Question,
);

export const BFIS_FS_OTHER: QuestionnaireDef = {
  code: "BFIS_FS_OTHER",
  formCode: "BFIS_FS_OTHER",
  type: "OTHER",
  name: "BFIS_FS_OTHER",
  instruction:
    "Potrebbe cortesemente descrivere il comportamento di questa persona che conosce bene, riportando quanta difficoltà nel funzionare efficientemente in ognuna di queste principali attività di vita? Ovvero, in che grado è compromessa in ciascuno di questi domini di vita? Selezioni per favore il numero (dove 0 sta a 'per niente' e 9 sta a 'gravemente') che meglio descrive le difficoltà di funzionamento della persona in valutazione NEGLI ULTIMI 6 MESI. Se la situazione descritta non risulta applicabile a questa persona (per esempio non guida l'auto, non ha figli, vive da solo/a, ecc.) per favore selezioni NA ('non applicabile').",

  respondents: ["Madre", "Padre", "Fratello/Sorella", "Coniuge/Partner", "Amico/a", "Altro"],

  questions,
};

export function computeBFISFSOther(answers: Record<string, any>) {
  const values: number[] = [];

  for (let i = 1; i <= 15; i++) {
    const ans = answers[qKey(i)];
    const raw = typeof ans === "string" ? ans : ans?.label; // supports both formats
    if (!raw) continue;

    const v = String(raw).trim().toUpperCase();
    if (v === "NA") continue;

    const n = Number(v);
    if (!Number.isNaN(n)) values.push(n);
  }

  const validCount = values.length;

  const meanImpairment =
    validCount === 0 ? "0" : (values.reduce((a, b) => a + b, 0) / validCount).toFixed(2);

  const compromisedCount = values.filter((v) => v >= 5).length;

  const compromisedPercentage =
    validCount === 0 ? "0%" : ((compromisedCount / validCount) * 100).toFixed(1) + "%";

  return {
    "Punteggio medio di compromissione (other)": meanImpairment,
    "Percentuale di domini compromessi (other)": compromisedPercentage,
  };
}
