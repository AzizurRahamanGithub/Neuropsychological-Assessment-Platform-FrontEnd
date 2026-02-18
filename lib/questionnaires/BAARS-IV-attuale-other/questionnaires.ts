import type { QuestionnaireDef } from "../types";
import { scoreFromLabel, qKey } from "../utils";

export const BAARS_IV_ATTUALE_OTHER: QuestionnaireDef = {
  code: "BAARS_IV_OTHER",
  formCode: "BAARS_IV_OTHER",
  type: "OTHER",
  name: "BAARS_IV_ATTUALE_OTHER",
  instruction:
    "Selezioni gentilmente il tipo di relazione con la persona in valutazione, poi risponda alle domande (ultimi 6 mesi).",

  respondents: [
    "Madre",
    "Padre",
    "Fratello/Sorella",
    "Coniuge/Partner",
    "Amico/a",
    "Altro",
  ],

  questions: [
    ...Array.from({ length: 27 }, (_, idx) => {
      const n = idx + 1;

      const TEXTS: Record<number, string> = {
        1: "Non presta adeguata attenzione ai dettagli o commette errori di distrazione?",
        2: "Ha difficoltà a mantenere l'attenzione sui compiti o in attività di svago?",
        3: "Non ascolta quando gli altri gli/le parlano?",
        4: "Non segue le istruzioni e non porta a termine i compiti o i suoi doveri?",
        5: "Ha difficoltà ad organizzare gli impegni e le attività da svolgere?",
        6: "Evita, prova avversione o è riluttante a impegnarsi in attività che richiedono uno sforzo mentale sostenuto?",
        7: "Perde le cose che gli/le servono per le incombenze o le attività da fare?",
        8: "Viene facilmente distratto/a da stimoli estranei o da pensieri irrilevanti?",
        9: "È sbadato/a nelle attività quotidiane?",
        10: "Muove di continuo mani e piedi e si agita quando è seduto/a?",
        11: "Si alza dalla sedia quando è in aula o in altre situazioni in cui dovrebbe stare seduto/a?",
        12: "Si sposta continuamente da un posto all'altro, si sente inquieto/a oppure come se fosse in trappola?",
        13: "Ha difficoltà a intraprendere attività di svago in modo tranquillo?",
        14: "È 'in movimento' oppure agisce come se fosse 'guidato/a da un motore'?",
        15: "Parla eccessivamente (in situazioni sociali)?",
        16: "Risponde impulsivamente prima che finiscano di formulare le domande, finisce le frasi degli altri oppure le anticipa?",
        17: "Ha difficoltà ad aspettare il suo turno?",
        18: "Interrompe o si inserisce nelle conversazioni o attività altrui senza permesso, oppure fa le cose al posto degli altri?",
        19: "Tende a sognare ad occhi aperti quando invece dovrebbe concentrarsi su qualcosa oppure lavorare?",
        20: "Ha difficoltà a stare attento/a o sveglio/a in situazioni noiose?",
        21: "Si confonde facilmente?",
        22: "Subito si annoia?",
        23: "Si sente strano/a o sulle nuvole?",
        24: "È pigro/a, si stanca più facilmente rispetto agli altri?",
        25: "È poco attivo/a, ha meno energia rispetto agli altri?",
        26: "Si muove lentamente?",
        27: "Sembra non riuscire ad elaborare le informazioni velocemente come gli altri?",
      };

      return {
        key: qKey(n),
        number: n,
        text: `${n}. ${TEXTS[n] ?? ""}`,
        type: "single_choice" as const,
        required: true,
        options: [
          { label: "A) Mai o raramente" },
          { label: "B) Qualche volta" },
          { label: "C) Spesso" },
          { label: "D) Molto spesso" },
        ],
      };
    }),

    {
      key: qKey(28),
      number: 28,
      text: "Quanti anni aveva la persona in valutazione quando i sintomi hanno avuto inizio?",
      type: "text",
      required: true,
    },

    {
      key: qKey(29),
      number: 29,
      text: "In quali ambienti i sintomi della persona in valutazione compromettono la prestazione? (Selezioni tutte le situazioni)",
      type: "multiple_choice",
      required: true,
      options: [
        { label: "Scuola" },
        { label: "Casa" },
        { label: "Lavoro" },
        { label: "Situazioni sociali" },
      ],
    },
  ],
};

function stripUiSuffix(v: unknown) {
  if (typeof v !== "string") return v;
  return v.split("__")[0].trim();
}

function rawStringFromAnswer(ans: any): string {
  if (ans == null) return "";
  if (typeof ans === "string" || typeof ans === "number")
    return String(stripUiSuffix(ans)).trim();
  if (typeof ans === "object") {
    const raw =
      (ans as any).label ?? (ans as any).value ?? (ans as any).id ?? "";
    return String(stripUiSuffix(raw)).trim();
  }
  return "";
}

function cleanLabel(s: string) {
  let out = s.trim();
  out = out.replace(/^[A-D]\)\s*/i, "");
  out = out.replace(/^\d+\.\s*/, "");
  out = out.replace(/\s+/g, " ").trim();
  return out;
}

function labelFromAnswer(ans: any): string {
  return cleanLabel(rawStringFromAnswer(ans));
}

function toScoreFromAnswer(ans: any): number {
  if (ans == null) return 0;

  if (typeof ans === "number" && Number.isFinite(ans)) {
    if (ans >= 0 && ans <= 3) return ans + 1;
    if (ans >= 1 && ans <= 4) return ans;
    return 0;
  }

  if (typeof ans === "object") {
    const v = (ans as any).value ?? (ans as any).id ?? null;
    if (typeof v === "number" && Number.isFinite(v)) {
      if (v >= 0 && v <= 3) return v + 1;
      if (v >= 1 && v <= 4) return v;
    }
    if (typeof v === "string") {
      const n = Number(stripUiSuffix(v));
      if (!Number.isNaN(n) && Number.isFinite(n)) {
        if (n >= 0 && n <= 3) return n + 1;
        if (n >= 1 && n <= 4) return n;
      }
    }
  }

  const raw = rawStringFromAnswer(ans).toUpperCase();
  if (raw.includes("A)")) return 1;
  if (raw.includes("B)")) return 2;
  if (raw.includes("C)")) return 3;
  if (raw.includes("D)")) return 4;
  if (raw === "A") return 1;
  if (raw === "B") return 2;
  if (raw === "C") return 3;
  if (raw === "D") return 4;

  const label = labelFromAnswer(ans);
  if (!label) return 0;
  const s = scoreFromLabel(label);
  return Number.isFinite(s) ? s : 0;
}

function textToString(raw: any): string {
  if (raw == null) return "";
  if (typeof raw === "string" || typeof raw === "number") {
    return String(stripUiSuffix(raw)).trim();
  }
  if (typeof raw === "object") {
    const v = (raw as any).value ?? (raw as any).id ?? (raw as any).label ?? "";
    return String(stripUiSuffix(v)).trim();
  }
  return "";
}

function multiToString(raw: any): string {
  if (!Array.isArray(raw)) return "";
  return raw
    .map((x) => cleanLabel(rawStringFromAnswer(x)))
    .filter(Boolean)
    .join(", ");
}

const RDI_CUTOFF = {
  disattenzione: "≥7.6",
  iperattivita: "≥4.6",
  impulsivita: "≥3.5",
  sct: "≥8.4",
  totale_adhd: "≥13.0",
} as const;

type AgeBandKey = "18-39" | "40-59" | "60-89";
function pickAgeBand(age: number): AgeBandKey {
  if (age >= 18 && age <= 39) return "18-39";
  if (age >= 40 && age <= 59) return "40-59";
  return "60-89";
}

export type ComputeCtx = {
  patientAge?: number | null;
  patientGender?: string | null;
  selfResults?: Record<string, string> | null; // values from computeBAARSIVSelf()
};

export function computeBAARSIVOther(
  answers: Record<string, any>,
  ctx?: ComputeCtx,
) {
  const scores_1_9: number[] = [];
  const scores_10_14: number[] = [];
  const scores_15_18: number[] = [];
  const scores_19_27: number[] = [];

  for (let i = 1; i <= 9; i++)
    scores_1_9.push(toScoreFromAnswer(answers[qKey(i)]));
  for (let i = 10; i <= 14; i++)
    scores_10_14.push(toScoreFromAnswer(answers[qKey(i)]));
  for (let i = 15; i <= 18; i++)
    scores_15_18.push(toScoreFromAnswer(answers[qKey(i)]));
  for (let i = 19; i <= 27; i++)
    scores_19_27.push(toScoreFromAnswer(answers[qKey(i)]));

  const etaInizioSintomi = textToString(answers[qKey(28)]);
  const ambitiDiCompromissione = multiToString(answers[qKey(29)]);

  const reportBy = textToString(answers["report_by"]);
  const reportByOther = textToString(answers["report_by_other"]);

  const disattenzionePunteggio = scores_1_9.reduce((a, b) => a + b, 0);
  const disattenzioneNSintomi = scores_1_9.filter((s) => s >= 3).length;

  const iperattivitaPunteggio = scores_10_14.reduce((a, b) => a + b, 0);
  const iperattivitaNSintomi = scores_10_14.filter((s) => s >= 3).length;

  const impulsivitaPunteggio = scores_15_18.reduce((a, b) => a + b, 0);
  const impulsivitaNSintomi = scores_15_18.filter((s) => s >= 3).length;

  const sctPunteggio = scores_19_27.reduce((a, b) => a + b, 0);
  const sctNSintomi = scores_19_27.filter((s) => s >= 3).length;

  const totaleADHDPunteggio =
    disattenzionePunteggio + iperattivitaPunteggio + impulsivitaPunteggio;

  const totaleADHDNSintomi =
    disattenzioneNSintomi + iperattivitaNSintomi + impulsivitaNSintomi;

  const age = Number(ctx?.patientAge ?? 0);
  const band = age > 0 ? pickAgeBand(age) : "";

  // NOTE: For OTHER we keep ESITO/STAT based on SELF vs OTHER difference (Excel ABS),
  // as requested. (If you also need "other vs cutoff" esito separately, tell me.)
  let disattenzioneSTAT = "—";
  let iperattivitaSTAT = "—";
  let impulsivitaSTAT = "—";
  let sctSTAT = "—";
  let totaleADHDSTAT = "—";

  let disattenzioneRDIEsito = "";
  let iperattivitaRDIEsito = "";
  let impulsivitaRDIEsito = "";
  let sctRDIEsito = "";
  let totaleADHDRDIEsito = "";

  // ✅ NEW: robust numeric parsing from SELF results + ABS diff like Excel
  function numFromSelf(key: string): number {
    const raw = ctx?.selfResults?.[key];
    if (raw == null) return NaN;

    // normalize "12,3" -> "12.3", strip symbols like "°", "—", etc.
    const s = String(raw)
      .trim()
      .replace(",", ".")
      .replace(/[^\d.\-]/g, "");
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  }

  function diffStat(selfKey: string, otherScore: number, cutoff: number) {
    const selfVal = numFromSelf(selfKey);
    if (!Number.isFinite(selfVal)) {
      return { stat: "—", esito: "" };
    }
    const diff = Math.abs(selfVal - otherScore); // ✅ Excel ABS(self - other)
    return {
      stat: diff.toFixed(1),
      esito: diff >= cutoff ? "*" : "", // ✅ "*" when diff ≥ cutoff
    };
  }

  if (ctx?.selfResults) {
    const d = diffStat(
      "Disattenzione punteggio PG",
      disattenzionePunteggio,
      7.6,
    );
    const h = diffStat("Iperattività punteggio PG", iperattivitaPunteggio, 4.6);
    const i = diffStat("Impulsività punteggio PG", impulsivitaPunteggio, 3.5);
    const s = diffStat("SCT punteggio PG", sctPunteggio, 8.4);
    const t = diffStat("Totale ADHD punteggio PG", totaleADHDPunteggio, 13.0);

    disattenzioneSTAT = d.stat;
    disattenzioneRDIEsito = d.esito;

    iperattivitaSTAT = h.stat;
    iperattivitaRDIEsito = h.esito;

    impulsivitaSTAT = i.stat;
    impulsivitaRDIEsito = i.esito;

    sctSTAT = s.stat;
    sctRDIEsito = s.esito;

    totaleADHDSTAT = t.stat;
    totaleADHDRDIEsito = t.esito;
  }

  return {
    "Disattenzione punteggio PG": String(disattenzionePunteggio),
    "Disattenzione punteggio CUTOFF": RDI_CUTOFF.disattenzione,
    "Disattenzione punteggio STAT": disattenzioneSTAT,
    "Disattenzione punteggio ESITO": disattenzioneRDIEsito,
    "Disattenzione n° sintomi PG": String(disattenzioneNSintomi),

    "Iperattività punteggio PG": String(iperattivitaPunteggio),
    "Iperattività punteggio CUTOFF": RDI_CUTOFF.iperattivita,
    "Iperattività punteggio STAT": iperattivitaSTAT,
    "Iperattività punteggio ESITO": iperattivitaRDIEsito,
    "Iperattività n° sintomi PG": String(iperattivitaNSintomi),

    "Impulsività punteggio PG": String(impulsivitaPunteggio),
    "Impulsività punteggio CUTOFF": RDI_CUTOFF.impulsivita,
    "Impulsività punteggio STAT": impulsivitaSTAT,
    "Impulsività punteggio ESITO": impulsivitaRDIEsito,
    "Impulsività n° sintomi PG": String(impulsivitaNSintomi),

    "SCT punteggio PG": String(sctPunteggio),
    "SCT punteggio CUTOFF": RDI_CUTOFF.sct,
    "SCT punteggio STAT": sctSTAT,
    "SCT punteggio ESITO": sctRDIEsito,
    "SCT n° sintomi PG": String(sctNSintomi),

    "Totale ADHD punteggio PG": String(totaleADHDPunteggio),
    "Totale ADHD punteggio CUTOFF": RDI_CUTOFF.totale_adhd,
    "Totale ADHD punteggio STAT": totaleADHDSTAT,
    "Totale ADHD punteggio ESITO": totaleADHDRDIEsito,
    "Totale ADHD n° sintomi PG": String(totaleADHDNSintomi),

    "Età inizio sintomi TEXT": etaInizioSintomi,
    "Ambiti di compromissione MULTI": ambitiDiCompromissione,
    "Age band used": band,
  };
}
