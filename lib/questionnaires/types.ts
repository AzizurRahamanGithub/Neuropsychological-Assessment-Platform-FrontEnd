export type QuestionnaireType = "SELF" | "OTHER";
export type QuestionType = "text" | "single_choice" | "multiple_choice";

export type Option = {
  label: string; // text only
};

export type Question = {
  key: string;          // unique key for answer map (ex: q1, q2)
  number: number;
  text: string;
  type: QuestionType;
  required?: boolean;
  options?: Option[];   // only if single/multiple
};

export type QuestionnaireDef = {
  code: string;               // BAARS_IV
  formCode: string;           // BAARS_IV_SELF / BAARS_IV_OTHER
  type: QuestionnaireType;    // SELF/OTHER
  name: string;
  instruction?: string;
  questions: Question[];
  respondents?: string[];
};
