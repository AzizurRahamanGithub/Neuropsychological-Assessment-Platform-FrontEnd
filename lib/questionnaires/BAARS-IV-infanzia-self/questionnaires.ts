import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

const OPTIONS_1_4 = [
  { label: "Mai o raramente" }, // 1
  { label: "Qualche volta" },   // 2
  { label: "Spesso" },          // 3
  { label: "Molto spesso" },    // 4
] as const;

const QUESTIONS_1_18: string[] = [
  "Non prestavo adeguata attenzione ai dettagli o commettevo errori di distrazione",
  "Avevo difficoltà a mantenere l’attenzione sui compiti o in attività di svago",
  "Non ascoltavo quando gli altri mi parlavano",
  "Non seguivo le istruzioni e non portavo a termine i compiti o i miei doveri",
  "Avevo difficoltà ad organizzare i compiti e le attività da svolgere",
  "Evitavo o ero riluttante a impegnarmi in attività che richiedevano uno sforzo mentale sostenuto",
  "Perdevo le cose che mi servivano per i compiti o le attività da svolgere",
  "Venivo distratto/a facilmente da stimoli estranei o da pensieri irrilevanti",
  "Ero sbadato/a nelle attività quotidiane",

  "Muovevo di continuo mani e piedi o mi agitavo quando ero seduto/a",
  "Mi alzavo dalla sedia quando avrei dovuto stare seduto/a",
  "Mi spostavo continuamente o mi sentivo inquieto/a",
  "Avevo difficoltà a intraprendere attività di svago in modo tranquillo",
  "Ero “in movimento” come se fossi guidato/a da un motore",
  "Parlavo eccessivamente (in situazioni sociali)",
  "Rispondevo impulsivamente prima che finissero le domande",
  "Avevo difficoltà ad aspettare il mio turno",
  "Interrompevo o mi inserivo nelle conversazioni o attività altrui",
];

const questions: Question[] = QUESTIONS_1_18.map(
  (text, i) =>
    ({
      key: `q${i + 1}`,
      number: i + 1,
      text,
      type: "single_choice",
      required: true,
      options: [...OPTIONS_1_4],
    }) satisfies Question,
);

// Q19 – environments (multiple choice)
questions.push({
  key: "q19",
  number: 19,
  text: "In quali ambienti i sintomi Le davano problemi? (selezioni tutte le situazioni)",
  type: "multiple_choice",
  required: true,
  options: [
    { label: "Scuola" },
    { label: "Casa" },
    { label: "Lavoro" },
    { label: "Situazioni sociali" },
  ],
});

export const BAARS_IV_INFANZIA_SELF: QuestionnaireDef = {
  code: "BAARS_IV_INFANZIA_SELF",
  formCode: "BAARS_IV_INFANZIA_SELF",
  type: "SELF",
  name: "BAARS_IV_INFANZIA_SELF",
  instruction:
    "Per ognuna delle seguenti affermazioni, selezioni l’opzione che meglio descrive la frequenza del Suo comportamento quando era un/a bambino/a, di età compresa tra i 5 e i 12 anni.",

  questions,
};


export function computeBAARSIVChildhoodSelf(answers: Record<string, any>) {
  const inatt: number[] = [];
  const hyper: number[] = [];

  for (let i = 1; i <= 9; i++) {
    const ans = answers[qKey(i)];
    const label = typeof ans === "string" ? ans : ans?.label;
    inatt.push(scoreFromLabel(label));
  }

  for (let i = 10; i <= 18; i++) {
    const ans = answers[qKey(i)];
    const label = typeof ans === "string" ? ans : ans?.label;
    hyper.push(scoreFromLabel(label));
  }

  const inattScore = inatt.reduce((a, b) => a + b, 0);
  const inattSymptoms = inatt.filter((v) => v >= 3).length;

  const hyperScore = hyper.reduce((a, b) => a + b, 0);
  const hyperSymptoms = hyper.filter((v) => v >= 3).length;

  // environments
  const envRaw = answers[qKey(19)];
  const env = Array.isArray(envRaw)
    ? envRaw.map(String).join(", ")
    : "";

  return {
    "Disattenzione punteggio (childhood)": String(inattScore),
    "Disattenzione n° sintomi (childhood)": String(inattSymptoms),
    "Iperattività/Impulsività punteggio (childhood)": String(hyperScore),
    "Iperattività/Impulsività n° sintomi (childhood)": String(hyperSymptoms),
    "Ambienti con difficoltà (childhood)": env,
  };
}
