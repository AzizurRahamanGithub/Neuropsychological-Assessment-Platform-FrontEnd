export type QuestionnaireType = 'SELF' | 'OTHER';

export type QuestionOption = { value: string; label: string };

export type QuestionDef = {
  id: string;
  text: string;
  options: QuestionOption[];
};

export type QuestionnaireDef = {
  id: number;
  code: string;
  name: string;
  description: string;
  type: QuestionnaireType;
  category: string;
  questions: QuestionDef[];
  // OTHER type হলে যারা fillup করবে
  respondents?: string[];
};

// import defs
import { questionlist1 } from './q1';
import { questionlist2 } from './q2';

export const QUESTIONNAIRES: QuestionnaireDef[] = [questionlist1, questionlist2];

export const getQuestionnaireByCode = (code: string) =>
  QUESTIONNAIRES.find(q => q.code === code);
