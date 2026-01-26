import type { QuestionnaireDef } from "./types";

import { BAARS_IV_ATTUALE_SELF, computeBAARSIVSelf } from "./BAARS-IV-attuale-self/questionnaires";
import { BAARS_IV_ATTUALE_OTHER, computeBAARSIVOther } from "./BAARS-IV-attuale-other/questionnaires";
import { BFIS_FS_OTHER, computeBFISFSOther } from "./BFIS-FS-other/questionnaires";
import { BAARS_IV_INFANZIA_SELF, computeBAARSIVChildhoodSelf} from "./BAARS-IV-infanzia-self/questionnaires";
// future: import other questionnaires...

export type QuestionnaireModule = {
  def: QuestionnaireDef;
  compute: (answers: Record<string, any>) => Record<string, string>;
};

export const QUESTIONNAIRE_REGISTRY: Record<string, QuestionnaireModule> = {
  [BAARS_IV_ATTUALE_SELF.formCode]: { def: BAARS_IV_ATTUALE_SELF, compute: computeBAARSIVSelf },
  [BAARS_IV_ATTUALE_OTHER.formCode]: { def: BAARS_IV_ATTUALE_OTHER, compute: computeBAARSIVOther },
  [BFIS_FS_OTHER.formCode]: { def: BFIS_FS_OTHER, compute: computeBFISFSOther },
  [BAARS_IV_INFANZIA_SELF.formCode]: { def: BAARS_IV_INFANZIA_SELF, compute: computeBAARSIVChildhoodSelf },
  // add more here...
};
