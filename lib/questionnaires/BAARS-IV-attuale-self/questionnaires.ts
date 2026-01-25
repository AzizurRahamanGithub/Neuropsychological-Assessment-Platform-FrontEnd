import type { QuestionnaireDef } from "../types";
import { scoreFromLabel, qKey } from "../utils";



export const BAARS_IV_ATTUALE_SELF: QuestionnaireDef = {
    code: "BAARS_IV",
    formCode: "BAARS_IV_SELF",
    type: "OTHER",
    name: "BAARS-IV (SELF Report)",
    instruction: "Answer as an informant (mom/father/partner).",
    questions: [

        {
            key: "q1",
            number: 1,
            text: "1. Non presto adeguata attenzione ai dettagli o commetto errori di distrazione?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q2",
            number: 2,
            text: "2. Ho difficoltà a mantenere l’attenzione sui compiti o in attività di svago?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q3",
            number: 3,
            text: "3. Non ascolto quando gli altri mi parlano?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q4",
            number: 4,
            text: "4. Non seguo le istruzioni e non porto a termine i compiti o i miei doveri?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q5",
            number: 5,
            text: "5. Ho difficoltà ad organizzare gli impegni e le attività da svolgere?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q6",
            number: 6,
            text: "6. Evito, provo avversione o sono riluttante a impegnarmi in attività che richiedono uno sforzo mentale sostenuto?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q7",
            number: 7,
            text: "7. Perdo le cose che mi servono per le incombenze o le attività da fare?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q8",
            number: 8,
            text: "8. Vengo facilmente distratto/a da stimoli estranei o da pensieri irrilevanti?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q9",
            number: 9,
            text: "9. Sono sbadato/a nelle attività quotidiane?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q10",
            number: 10,
            text: "10. Muovo di continuo mani e piedi e mi agito/a o mi dimeno quando sono seduto/a?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q11",
            number: 11,
            text: "11. Mi alzo dalla sedia quando sono in aula o in altre situazioni in cui dovrei stare seduto/a?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q12",
            number: 12,
            text: "12. Mi sposto continuamente da un posto all’altro, mi sento inquieto/a oppure come se fossi in trappola?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q13",
            number: 13,
            text: "13. Ho difficoltà a intraprendere attività di svago in modo tranquillo (mi sento a disagio o rumoroso/a)?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q14",
            number: 14,
            text: "14. Sono “in movimento” oppure agisco come se fossi “guidato/a da un motore” (mi sento come se dovessi essere sempre occupato/a o impegnato/a in qualcosa)?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q15",
            number: 15,
            text: "15. Parlo eccessivamente (in situazioni sociali)?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q16",
            number: 16,
            text: "16. Rispondo impulsivamente prima che finiscano di formulare le domande, finisco le frasi degli altri oppure le anticipo?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q17",
            number: 17,
            text: "17. Ho difficoltà ad aspettare il mio turno?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q18",
            number: 18,
            text: "18. Interrompo o mi inserisco nelle conversazioni o attività altrui senza permesso, oppure faccio le cose al posto degli altri?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q19",
            number: 19,
            text: "19. Tendo a sognare ad occhi aperti quando invece dovrei concentrarmi su qualcosa oppure lavorare?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q20",
            number: 20,
            text: "20. Ho difficoltà a stare attento/a o sveglio/a in situazioni noiose?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q21",
            number: 21,
            text: "21. Mi confondo facilmente?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q22",
            number: 22,
            text: "22. Subito mi annoio?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q23",
            number: 23,
            text: "23. Mi sento strano/a o sulle nuvole?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q24",
            number: 24,
            text: "24. Sono pigro/a o mi stanco più facilmente rispetto agli altri?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q25",
            number: 25,
            text: "25. Sono poco attivo/a o ho meno energia rispetto agli altri?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q26",
            number: 26,
            text: "26. Mi muovo lentamente?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q27",
            number: 27,
            text: "27. Mi sembra di non riuscire ad elaborare le informazioni velocemente come gli altri?",
            type: "single_choice",
            required: true,
            options: [
                { label: "A) Mai o raramente " },
                { label: "B) Qualche volta " },
                { label: "C) Spesso " },
                { label: "D) Molto spesso " },
            ],
        },
        {
            key: "q28",
            number: 28,
            text: "28. Quanti anni aveva quando i sintomi hanno avuto inizio?",
            type: "text",
            required: true
        },
        {
            key: "q29",
            number: 29,
            text: "29. In quali ambienti i sintomi Le danno problemi? Selezioni tutte le situazioni in cui ha difficoltà?",
            type: "multiple_choice",
            required: true,
            options: [
                { label: "A) Scuola" },
                { label: "B) Casa" },
                { label: "C) Lavoro" },
                { label: "D) Situazioni  social" },
            ],
        },


    ],
};

export function computeBAARSIVSelf(answers: Record<string, any>) {
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

    // ✅ Q28 (text) -> string
    const etaInizioRaw = answers[qKey(28)];
    const etaInizioSintomi =
        etaInizioRaw === undefined || etaInizioRaw === null ? "" : String(etaInizioRaw).trim();

    // ✅ Q29 (multiple choice) -> string
    const ambitiRaw = answers[qKey(29)];
    const ambitiArray: string[] = Array.isArray(ambitiRaw) ? ambitiRaw.map(String) : [];
    const ambitiDiCompromissione = ambitiArray
        .map((s) => s.trim())
        .filter(Boolean)
        .join(", ");

    const disattenzionePunteggio = scores_1_9.reduce((a, b) => a + b, 0);
    const disattenzioneNSintomi = scores_1_9.filter((s) => s >= 3).length;

    const iperattivitàPunteggio = scores_10_14.reduce((a, b) => a + b, 0);
    const iperattivitàSintomi = scores_10_14.filter((s) => s >= 3).length;

    const impulsivitàPunteggio = scores_10_14.reduce((a, b) => a + b, 0);
    const impulsivitàSintomi = scores_10_14.filter((s) => s >= 3).length;

    const SCTPunteggio = scores_10_14.reduce((a, b) => a + b, 0);
    const SCTSintomi = scores_10_14.filter((s) => s >= 3).length;


    return {
        "Disattenzione punteggio": String(disattenzionePunteggio),
        "Disattenzione n° sintomi": String(disattenzioneNSintomi),
        "Iperattività punteggio": String(iperattivitàPunteggio),
        "Iperattività n° sintomi": String(iperattivitàSintomi),
        "Impulsività punteggio": String(impulsivitàPunteggio),
        "Impulsività n° sintomi": String(impulsivitàSintomi),
        "SCT punteggio": String(SCTPunteggio),
        "SCT n° sintomi": String(SCTSintomi),
        "Età inizio sintomi": etaInizioSintomi,
        "Ambiti di compromissione": ambitiDiCompromissione,
    };
}