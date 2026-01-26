import type { QuestionnaireDef } from "../types";
import { scoreFromLabel, qKey } from "../utils";

export const BAARS_IV_ATTUALE_OTHER: QuestionnaireDef = {
  code: "BAARS_IV_OTHER",
  formCode: "BAARS_IV_OTHER",
  type: "OTHER",
  name: "BAARS_IV_ATTUALE_OTHER",
  instruction:
    "Selezioni gentilmente il tipo di relazione con la persona in valutazione, poi risponda alle domande (ultimi 6 mesi).",
  // ✅ THIS is extra for OTHER (respondent selection at top)
  respondents: ["Madre", "Padre", "Fratello/Sorella", "Coniuge/Partner", "Amicola", "Altro"],

  questions: [
    // Q1 - Q27 single_choice
    ...Array.from({ length: 27 }, (_, idx) => {
      const n = idx + 1;

      // ✅ put your exact text here (copy from excel)
      const TEXTS: Record<number, string> = {
        1: "Non presta adeguata attenzione ai dettagli o commette errori di distrazione?",
        2: "Ha difficoltà a mantenere l’attenzione sui compiti o in attività di svago?",
        3: "Non ascolta quando gli altri gli/le parlano?",
        4: "Non segue le istruzioni e non porta a termine i compiti o i suoi doveri?",
        5: "Ha difficoltà ad organizzare gli impegni e le attività da svolgere?",
        6: "Evita, prova avversione o è riluttante a impegnarsi in attività che richiedono uno sforzo mentale sostenuto?",
        7: "Perde le cose che gli/le servono per le incombenze o le attività da fare?",
        8: "Viene facilmente distratto/a da stimoli estranei o da pensieri irrilevanti?",
        9: "È sbadato/a nelle attività quotidiane?",
        10: "Muove di continuo mani e piedi e si agita quando è seduto/a?",
        11: "Si alza dalla sedia quando è in aula o in altre situazioni in cui dovrebbe stare seduto/a?",
        12: "Si sposta continuamente da un posto all’altro, si sente inquieto/a oppure come se fosse in trappola?",
        13: "Ha difficoltà a intraprendere attività di svago in modo tranquillo?",
        14: "È “in movimento” oppure agisce come se fosse “guidato/a da un motore”?",
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
          { label: "A) Mai o raramente " },
          { label: "B) Qualche volta " },
          { label: "C) Spesso " },
          { label: "D) Molto spesso " },
        ],
      };
    }),

    // ✅ Q28 text
    {
      key: qKey(28),
      number: 28,
      text: " Quanti anni aveva la persona in valutazione quando i sintomi hanno avuto inizio?",
      type: "text",
      required: true,
    },

    // ✅ Q29 multiple choice
    {
      key: qKey(29),
      number: 29,
      text: " In quali ambienti i sintomi della persona in valutazione compromettono la prestazione? (Selezioni tutte le situazioni)",
      type: "multiple_choice",
      required: true,
      options: [
        { label: "A) Scuola" },
        { label: "B) Casa" },
        { label: "C) Lavoro" },
        { label: "D) Situazioni sociali" },
      ],
    },
  ],
};

export function computeBAARSIVOther(answers: Record<string, any>) {
  const scores_1_9: number[] = [];
  const scores_10_14: number[] = [];
  const scores_15_18: number[] = [];
  const scores_19_27: number[] = [];

  for (let i = 1; i <= 9; i++) {
    const ans = answers[qKey(i)];
    const label = typeof ans === "string" ? ans : ans?.label;
    scores_1_9.push(scoreFromLabel(label));
  }

  for (let i = 10; i <= 14; i++) {
    const ans = answers[qKey(i)];
    const label = typeof ans === "string" ? ans : ans?.label;
    scores_10_14.push(scoreFromLabel(label));
  }

  for (let i = 15; i <= 18; i++) {
    const ans = answers[qKey(i)];
    const label = typeof ans === "string" ? ans : ans?.label;
    scores_15_18.push(scoreFromLabel(label));
  }

  for (let i = 19; i <= 27; i++) {
    const ans = answers[qKey(i)];
    const label = typeof ans === "string" ? ans : ans?.label;
    scores_19_27.push(scoreFromLabel(label));
  }

  // ✅ Q28 string
  const etaInizioRaw = answers[qKey(28)];
  const etaInizioSintomi =
    etaInizioRaw === undefined || etaInizioRaw === null ? "" : String(etaInizioRaw).trim();

  // ✅ Q29 multiple -> string
  const ambitiRaw = answers[qKey(29)];
  const ambitiArray: string[] = Array.isArray(ambitiRaw) ? ambitiRaw.map(String) : [];
  const ambitiDiCompromissione = ambitiArray.map((s) => s.trim()).filter(Boolean).join(", ");

  // ✅ calculations
  const disattenzionePunteggio = scores_1_9.reduce((a, b) => a + b, 0);
  const disattenzioneNSintomi = scores_1_9.filter((s) => s >= 3).length;

  const iperattivitaPunteggio = scores_10_14.reduce((a, b) => a + b, 0);
  const iperattivitaNSintomi = scores_10_14.filter((s) => s >= 3).length;

  const impulsivitaPunteggio = scores_15_18.reduce((a, b) => a + b, 0);
  const impulsivitaNSintomi = scores_15_18.filter((s) => s >= 3).length;

  const sctPunteggio = scores_19_27.reduce((a, b) => a + b, 0);
  const sctNSintomi = scores_19_27.filter((s) => s >= 3).length;

  // ✅ respondent info (top selection)
  // You will save these from UI under these keys:
  const reportBy = (answers["report_by"] ?? "").toString().trim();          // Madre/Padre/.../Altro
  const reportByOther = (answers["report_by_other"] ?? "").toString().trim(); // if Altro

  return {
    "Report by": reportByOther ? `${reportBy} - ${reportByOther}` : reportBy,
    "Disattenzione punteggio": String(disattenzionePunteggio),
    "Disattenzione n° sintomi": String(disattenzioneNSintomi),
    "Iperattività punteggio": String(iperattivitaPunteggio),
    "Iperattività n° sintomi": String(iperattivitaNSintomi),
    "Impulsività punteggio": String(impulsivitaPunteggio),
    "Impulsività n° sintomi": String(impulsivitaNSintomi),
    "SCT punteggio": String(sctPunteggio),
    "SCT n° sintomi": String(sctNSintomi),
    "Età inizio sintomi": etaInizioSintomi,
    "Ambiti di compromissione": ambitiDiCompromissione,
  };
}
