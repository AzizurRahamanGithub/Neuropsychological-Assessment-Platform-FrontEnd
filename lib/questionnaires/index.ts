import type { QuestionnaireDef } from "./types";

import {
  BAARS_IV_ATTUALE_SELF,
  computeBAARSIVSelf,
} from "./BAARS-IV-attuale-self/questionnaires";
import {
  BAARS_IV_ATTUALE_OTHER,
  computeBAARSIVOther,
} from "./BAARS-IV-attuale-other/questionnaires";
import {
  BFISFL_OTHER,
  computeBFISFLOther,
} from "./BFIS-FS-other/questionnaires";
import {
  ADHD_RS5_DOCENTE_OTHER,
  computeADHDRS5DocenteOther,
} from "./ADHD-RS5-docente-other/questionnaires";
import {
  ADHD_RS5_GENITORE_OTHER,
  computeADHDRS5GenitoreOther,
} from "./ADHD-RS5-genitore-other/questionnaires";
import { STAI_OTHER, computeStaiOther } from "./STAI-other/questionnaires";

import {
  BAARS_IV_INFANZIA_SELF,
  computeBAARSIVChildhoodSelf,
  type ComputeCtx as BAARSChildCtx,
} from "./BAARS-IV-infanzia-self/questionnaires";
import {
  ASRS_ADOLESCENTE_SELF,
  computeASRSAdolescenteSelf,
} from "./ASRS-adolescente-self/questionnaires";
import { BIS11_SELF, computeBIS11Self } from "./BIS-11-self/questionnaires";
import { PAS_SELF, computePASSelf } from "./PAS-self/questionnaires";
import { RAADS_R_SELF, computeRAADSRSelf } from "./RAADS-R-self/questionnaires";
import { AQ10_SELF, computeAQ10Self } from "./AQ-10-self/questionnaires";
import { AQ50_SELF, computeAQ50Self } from "./AQ-50-self/questionnaires";
import { EQ10_SELF, computeEQ10Self } from "./EQ-10-self/questionnaires";
import { EQ40_SELF, computeEQ40Self } from "./EQ-40-self/questionnaires";
import { CATQ_SELF, computeCATQSelf } from "./CAT-Q-self/questionnaires";
import { CFQ11_SELF, computeCFQ11Self } from "./CFQ-11-Self/questionnaires";
import { TAS20_SELF, computeTAS20Self } from "./TAS-20-self/questionnaires";
import { MW_SELF, computeMWSelf } from "./MW-self/questionnaires";
import { SCL90R_SELF, computeSCL90RSelf } from "./SCL-90-R-self/questionnaires";
import { MFSS30_SELF, computeMFSS30Self } from "./MFSS-30-self/questionnaires";
import { BDI_II_SELF, computeBDIIISelf } from "./BDI-II-self/questionnaires";
import { HADS_SELF, computeHADSSelf } from "./HADS-self/questionnaires";
import { DERS_SELF, computeDERSSelf } from "./DERS-self/questionnaires";
import {
  VINEGUARDPLUS_SELF,
  computeVINEGUARDPLUSSelf,
} from "./VINEGUARD-PLUS-self/questionnaires";
import { IRI_SELF, computeIRISelf } from "./IRI-self/questionnaires";

// ✅ global compute ctx (extend later if needed)
export type ComputeCtx = {
  patientAge?: number | null;
  patientSex?: string | null;
  patientEducation?: number | null;
};

export type QuestionnaireModule = {
  def: QuestionnaireDef;
  compute: (
    answers: Record<string, any>,
    ctx?: ComputeCtx,
  ) => Record<string, any>;
};

export const QUESTIONNAIRE_REGISTRY: Record<string, QuestionnaireModule> = {
  [BAARS_IV_ATTUALE_SELF.formCode]: {
    def: BAARS_IV_ATTUALE_SELF,
    compute: (a, ctx) => computeBAARSIVSelf(a, ctx),
  },

  [BAARS_IV_ATTUALE_OTHER.formCode]: {
    def: BAARS_IV_ATTUALE_OTHER,
    compute: (a, ctx) => computeBAARSIVOther(a, ctx),
  },

  [BFISFL_OTHER.formCode]: {
    def: BFISFL_OTHER,
    compute: (a, ctx) => computeBFISFLOther(a, ctx),
  },

  // ✅ age-based compute
  [BAARS_IV_INFANZIA_SELF.formCode]: {
    def: BAARS_IV_INFANZIA_SELF,
    compute: (a, ctx) => computeBAARSIVChildhoodSelf(a, ctx as BAARSChildCtx),
  },
  [ADHD_RS5_DOCENTE_OTHER.formCode]: {
    def: ADHD_RS5_DOCENTE_OTHER,
    compute: (a, ctx) => computeADHDRS5DocenteOther(a, ctx),
  },
  [ADHD_RS5_GENITORE_OTHER.formCode]: {
    def: ADHD_RS5_GENITORE_OTHER,
    compute: (a, ctx) => computeADHDRS5GenitoreOther(a, ctx),
  },
  [STAI_OTHER.formCode]: {
    def: STAI_OTHER,
    compute: (a, ctx) => computeStaiOther(a, ctx),
  },
  [ASRS_ADOLESCENTE_SELF.formCode]: {
    def: ASRS_ADOLESCENTE_SELF,
    compute: (a, ctx) => computeASRSAdolescenteSelf(a),
  },
  [BIS11_SELF.formCode]: {
    def: BIS11_SELF,
    compute: (a, ctx) => computeBIS11Self(a),
  },
  [PAS_SELF.formCode]: {
    def: PAS_SELF,
    compute: (a, ctx) => computePASSelf(a),
  },
  [RAADS_R_SELF.formCode]: {
    def: RAADS_R_SELF,
    compute: (a, ctx) => computeRAADSRSelf(a),
  },
  [AQ50_SELF.formCode]: {
    def: AQ50_SELF,
    compute: (a, ctx) => computeAQ50Self(a),
  },
  [AQ10_SELF.formCode]: {
    def: AQ10_SELF,
    compute: (a, ctx) => computeAQ10Self(a, ctx),
  },
  [EQ10_SELF.formCode]: {
    def: EQ10_SELF,
    compute: (a, ctx) => computeEQ10Self(a, ctx),
  },
  [EQ40_SELF.formCode]: {
    def: EQ40_SELF,
    compute: (a, ctx) => computeEQ40Self(a),
  },
  [CATQ_SELF.formCode]: {
    def: CATQ_SELF,
    compute: (a, ctx) => computeCATQSelf(a),
  },
  [CFQ11_SELF.formCode]: {
    def: CFQ11_SELF,
    compute: (a, ctx) => computeCFQ11Self(a),
  },
  [TAS20_SELF.formCode]: {
    def: TAS20_SELF,
    compute: (a, ctx) => computeTAS20Self(a),
  },
  [MW_SELF.formCode]: {
    def: MW_SELF,
    compute: (a, ctx) => computeMWSelf(a, ctx),
  },
  [SCL90R_SELF.formCode]: {
    def: SCL90R_SELF,
    compute: (a, ctx) => computeSCL90RSelf(a, ctx),
  },
  [MFSS30_SELF.formCode]: {
    def: MFSS30_SELF,
    compute: (a, ctx) => computeMFSS30Self(a, ctx),
  },
  [BDI_II_SELF.formCode]: {
    def: BDI_II_SELF,
    compute: (a, ctx) => computeBDIIISelf(a, ctx),
  },
  [HADS_SELF.formCode]: {
    def: HADS_SELF,
    compute: (a, ctx) => computeHADSSelf(a, ctx),
  },
  [DERS_SELF.formCode]: {
    def: DERS_SELF,
    compute: (a, ctx) => computeDERSSelf(a, ctx),
  },
  [VINEGUARDPLUS_SELF.formCode]: {
    def: VINEGUARDPLUS_SELF,
    compute: (a, ctx) => computeVINEGUARDPLUSSelf(a, ctx),
  },
  [IRI_SELF.formCode]: {
    def: IRI_SELF,
    compute: (a, ctx) => computeIRISelf(a, ctx),
  },
};
