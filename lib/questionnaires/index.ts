import type { QuestionnaireDef } from "./types";

import { BAARS_IV_ATTUALE_SELF, computeBAARSIVSelf } from "./BAARS-IV-attuale-self/questionnaires";

export type QuestionnaireModule = {
  def: QuestionnaireDef;
  compute: (answers: Record<string, any>) => Record<string, string>;
};

export const QUESTIONNAIRE_REGISTRY: QuestionnaireModule[] = [
  { def: BAARS_IV_ATTUALE_SELF, compute: computeBAARSIVSelf },
];
