import type { QuestionnaireDef } from "./types";

import { BAARS_IV_ATTUALE_SELF, computeBAARSIVSelf } from "./BAARS-IV-attuale-self/questionnaires";
import { BAARS_IV_ATTUALE_OTHER, computeBAARSIVOther } from "./BAARS-IV-attuale-other/questionnaires";
import { BFIS_FS_OTHER, computeBFISFSOther } from "./BFIS-FS-other/questionnaires";
import { ADHD_RS5_DOCENTE_OTHER, computeADHDRS5DocenteOther } from "./ADHD-RS5-docente-other/questionnaires";

import {
  BAARS_IV_INFANZIA_SELF,
  computeBAARSIVChildhoodSelf,
  type ComputeCtx as BAARSChildCtx,
} from "./BAARS-IV-infanzia-self/questionnaires";

// ✅ global compute ctx (extend later if needed)
export type ComputeCtx = {
  patientAge?: number | null;
};

export type QuestionnaireModule = {
  def: QuestionnaireDef;
  compute: (answers: Record<string, any>, ctx?: ComputeCtx) => Record<string, any>;
};

export const QUESTIONNAIRE_REGISTRY: Record<string, QuestionnaireModule> = {
  [BAARS_IV_ATTUALE_SELF.formCode]: {
    def: BAARS_IV_ATTUALE_SELF,
    compute: (a) => computeBAARSIVSelf(a),
  },

  [BAARS_IV_ATTUALE_OTHER.formCode]: {
    def: BAARS_IV_ATTUALE_OTHER,
    compute: (a) => computeBAARSIVOther(a),
  },

  [BFIS_FS_OTHER.formCode]: {
    def: BFIS_FS_OTHER,
    compute: (a) => computeBFISFSOther(a),
  },

  // ✅ age-based compute
  [BAARS_IV_INFANZIA_SELF.formCode]: {
    def: BAARS_IV_INFANZIA_SELF,
    compute: (a, ctx) => computeBAARSIVChildhoodSelf(a, ctx as BAARSChildCtx),
  },
  [ADHD_RS5_DOCENTE_OTHER.formCode]: {
    def: ADHD_RS5_DOCENTE_OTHER,
    compute: (a, ctx) => computeADHDRS5DocenteOther(a),
  },
};
