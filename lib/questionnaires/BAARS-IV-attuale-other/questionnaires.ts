import type { QuestionnaireDef } from "../types";

export const BAARS_IV_OTHER: QuestionnaireDef = {
  code: "BAARS_IV",
  formCode: "BAARS_IV_OTHER",
  type: "OTHER",
  name: "BAARS-IV (Other Report)",
  instruction: "Answer as an informant (mom/father/partner).",
  questions: [
    {
      key: "q1",
      number: 1,
      text: "Osservi difficoltà di concentrazione?",
      type: "single_choice",
      required: true,
      options: [
        { label: "Mai (0)" },
        { label: "Raramente (1)" },
        { label: "A volte (2)" },
        { label: "Spesso (3)" },
        { label: "Molto spesso (4)" },
      ],
    },
    {
      key: "q2",
      number: 2,
      text: "Osservi impulsività?",
      type: "single_choice",
      required: true,
      options: [
        { label: "Mai (0)" },
        { label: "Raramente (1)" },
        { label: "A volte (2)" },
        { label: "Spesso (3)" },
        { label: "Molto spesso (4)" },
      ],
    },
    {
      key: "q3",
      number: 3,
      text: "Scrivi note aggiuntive",
      type: "text",
      required: false,
    },
    {
      key: "q4",
      number: 4,
      text: "Seleziona difficoltà osservate",
      type: "multiple_choice",
      required: false,
      options: [{ label: "Iperattività" }, { label: "Distrazione" }],
    },
    {
      key: "q5",
      number: 5,
      text: "Quanto spesso succede?",
      type: "single_choice",
      required: true,
      options: [
        { label: "Mai (0)" },
        { label: "Raramente (1)" },
        { label: "A volte (2)" },
        { label: "Spesso (3)" },
        { label: "Molto spesso (4)" },
      ],
    },
  ],
};

export function computeBAARSIVOther(answers: Record<string, any>) {
  return {
    "Totale ADHD punteggio": "0",
    "Disattenzione punteggio": "0",
  };
}
