// src/lib/questionnaires/helper.ts
import { QUESTIONNAIRE_REGISTRY } from "./index";
import type { QuestionnaireDef } from "./types";
import type { QuestionnaireModule } from "./index";

export function getQuestionnaireByCode(codeOrFormCode: string): QuestionnaireDef | null {
  const modules = Object.values(QUESTIONNAIRE_REGISTRY);
  const found = modules.find(
    (m) => m.def.formCode === codeOrFormCode || m.def.code === codeOrFormCode
  );
  return found?.def ?? null;
}

export function getModuleByFormCode(formCode: string): QuestionnaireModule | null {
  return QUESTIONNAIRE_REGISTRY[formCode] ?? null;
}

export function getAllModules(): QuestionnaireModule[] {
  return Object.values(QUESTIONNAIRE_REGISTRY);
}
