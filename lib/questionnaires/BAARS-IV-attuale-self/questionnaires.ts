import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";


// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS_1_4 = [
    { label: "Mai o raramente", value: 1 },
    { label: "Qualche volta", value: 2 },
    { label: "Spesso", value: 3 },
    { label: "Molto spesso", value: 4 },
] as const;


const QUESTIONS_1_27: string[] = [
    "Non prestavo adeguata attenzione ai dettagli o commettevo errori di distrazione",
    "Avevo difficoltà a mantenere l’attenzione sui compiti o in attività di svago",
    "Non ascoltavo quando gli altri mi parlavano",
    "Non seguivo le istruzioni e non portavo a termine i compiti o i miei doveri",
    "Avevo difficoltà ad organizzare gli impegni e le attività da svolgere",
    "Evitavo, provavo avversione o ero riluttante ad impegnarmi in attività che richiedevano uno sforzo mentale sostenuto",
    "Perdevo le cose che mi servivano per le incombenze o le attività da fare",
    "Venivo distratto/a facilmente da stimoli estranei o da pensieri irrilevanti",
    "Ero sbadato/a nelle attività quotidiane",

    "Muovevo di continuo mani e piedi o mi agitavo quando ero seduto/a",
    "Mi alzavo dalla sedia quando ero in aula o in altre situazioni in cui avrei dovuto stare seduto/a",
    "Mi spostavo continuamente da un posto all’altro o mi sentivo inquieto/a, come se fossi in trappola",
    "Avevo difficoltà ad intraprendere attività di svago in modo tranquillo (mi sentivo a disagio, inappropriato/a o rumoroso/a)",
    "Sono “in movimento” oppure agisco come se fossi “guidato/a da un motore” (o mi sento come se dovessi essere sempre occupato/a o impegnato/a in qualcosa",

    "Parlavo eccessivamente in situazioni sociali",
    "Rispondevo impulsivamente prima che finissero di formulare le domande o anticipavo le frasi degli altri",
    "Avevo difficoltà ad aspettare il mio turno",
    "Interrompevo o mi inserivo nelle conversazioni o attività altrui senza permesso, oppure facevo le cose al posto degli altri",

    "Tendevo a sognare ad occhi aperti quando avrei dovuto concentrarmi o lavorare",
    "Avevo difficoltà a stare attento/a o sveglio/a in situazioni noiose",
    "Mi confondevo facilmente",
    "Mi annoiavo subito",
    "Mi sentivo strano/a o con la testa fra le nuvole",
    "Ero pigro/a o mi stancavo più degli altri",
    "Ero poco attivo/a e avevo meno energia rispetto agli altri",
    "Mi muovevo lentamente",
    "Avevo la sensazione di non riuscire ad elaborare le informazioni velocemente come gli altri"
];

const questions: Question[] = QUESTIONS_1_27.map(
    (text, i) =>
        ({
            key: `q${i + 1}`,
            number: i + 1,
            text,
            type: "single_choice",
            required: true,
            options: [...OPTIONS_1_4],
        }) satisfies Question,
);

// Q29-30 – environments

questions.push({
    key: "q28",
    number: 28,
    text: "Quanti anni aveva quando i sintomi hanno avuto inizio",
    type: "text",
    required: true,
});

questions.push({
    key: "q29",
    number: 29,
    text: "In quali ambienti i sintomi Le danno problemi? Selezioni tutte le situazioni in cui ha difficoltà",
    type: "multiple_choice",
    required: true,
    options: [
        { label: "Scuola" },
        { label: "Casa" },
        { label: "Lavoro" },
        { label: "Situazioni sociali" },
    ],
});



export const BAARS_IV_ATTUALE_SELF: QuestionnaireDef = {
    code: "BAARS_IV_ATTUALE_SELF",
    formCode: "BAARS_IV_ATTUALE_SELF",
    type: "SELF",
    name: "BAARS_IV_ATTUALE_SELF",
    instruction: "Per ognuna delle seguenti affermazioni, per favore selezioni l'opzione che meglio descrive la frequenza del Suo comportamento NEGLI ULTIMI 6 MESI.",
    questions,
};


// ===============================
// ✅ AGE-BASED NORMS CONFIG
// ===============================

type Esito =
    | "fortemente sintomatico"
    | "moderatamente sintomatico"
    | "lievemente sintomatico"
    | "";

type Stat = string; // allow "99°" + also ranges like "51-75°"


type RangeRow = { min: number; max: number; stat: Stat; esito: Esito };

type NormGroup = {
    disattenzione_punteggio: RangeRow[];
    disattenzione_sintomi: RangeRow[];
    iperattivita_punteggio: RangeRow[];
    //   iperattivita_sintomi: RangeRow[];
    impulsivita_punteggio: RangeRow[];
    //   impulsivita_sintomi: RangeRow[];
    totale_adhd_punteggio: RangeRow[];
    totale_adhd_sintomi: RangeRow[];
    SCT_punteggio: RangeRow[];
    SCT_sintomi: RangeRow[];
    iperattivita_impulsivita_sintomi: RangeRow[];
};

type AgeBandKey = "18-39" | "40-59" | "60-89";

const BAARS_CHILDHOOD_NORMS: Record<AgeBandKey, NormGroup> = {
    "18-39": {
        disattenzione_punteggio: [
            { min: 27, max: 36, stat: "99°", esito: "fortemente sintomatico" },
            { min: 24, max: 26, stat: "98°", esito: "moderatamente sintomatico" },

            { min: 23, max: 23, stat: "97°", esito: "moderatamente sintomatico" },
            { min: 22, max: 22, stat: "96°", esito: "moderatamente sintomatico" },

            { min: 21, max: 21, stat: "95°", esito: "lievemente sintomatico" },
            { min: 20, max: 20, stat: "94°", esito: "lievemente sintomatico" },

            // table-এ ESITO ফাঁকা ছিল
            { min: 19, max: 19, stat: "92°", esito: "" },
            { min: 18, max: 18, stat: "90°", esito: "" },
            { min: 17, max: 17, stat: "83°", esito: "" },
            { min: 16, max: 16, stat: "78°", esito: "" },

            { min: 14, max: 15, stat: "51–75°", esito: "" },
            { min: 9, max: 13, stat: "1–50°", esito: "" },
        ],

        disattenzione_sintomi: [
            { min: 7, max: 9, stat: "99°", esito: "fortemente sintomatico" },

            { min: 6, max: 6, stat: "98°", esito: "moderatamente sintomatico" },
            { min: 5, max: 5, stat: "97°", esito: "moderatamente sintomatico" },
            { min: 4, max: 4, stat: "96°", esito: "moderatamente sintomatico" },

            { min: 3, max: 3, stat: "93°", esito: "lievemente sintomatico" },

            { min: 2, max: 2, stat: "89°", esito: "" },
            { min: 1, max: 1, stat: "83°", esito: "" },

            { min: 0, max: 0, stat: "1–75°", esito: "" },
        ],


        iperattivita_punteggio: [
            { min: 16, max: 20, stat: "99°", esito: "fortemente sintomatico" },
            { min: 14, max: 15, stat: "98°", esito: "moderatamente sintomatico" },

            { min: 13, max: 13, stat: "97°", esito: "moderatamente sintomatico" },
            { min: 12, max: 12, stat: "96°", esito: "moderatamente sintomatico" },

            { min: 11, max: 11, stat: "95°", esito: "lievemente sintomatico" },

            // 10 টা 93° row-এ আছে
            { min: 10, max: 10, stat: "93°", esito: "lievemente sintomatico" },

            { min: 17, max: 17, stat: "83°", esito: "" },
            { min: 16, max: 16, stat: "78°", esito: "" },

            { min: 6, max: 7, stat: "51–75°", esito: "" },
            { min: 5, max: 5, stat: "1–50°", esito: "" },
        ],

        impulsivita_punteggio: [
            { min: 13, max: 16, stat: "99°", esito: "fortemente sintomatico" },
            { min: 12, max: 12, stat: "98°", esito: "moderatamente sintomatico" },

            // 11 টা 96° row-এ আছে
            { min: 11, max: 11, stat: "96°", esito: "moderatamente sintomatico" },
            { min: 10, max: 10, stat: "95°", esito: "lievemente sintomatico" },

            { min: 9, max: 9, stat: "92°", esito: "" },
            { min: 8, max: 8, stat: "88°", esito: "" },
            { min: 7, max: 7, stat: "76°", esito: "" },

            { min: 4, max: 5, stat: "1–50°", esito: "" },
        ],

        iperattivita_impulsivita_sintomi:
            [
                { min: 6, max: 9, stat: "99°", esito: "fortemente sintomatico" },

                { min: 5, max: 5, stat: "98°", esito: "moderatamente sintomatico" },
                { min: 4, max: 4, stat: "96°", esito: "moderatamente sintomatico" },

                { min: 3, max: 3, stat: "93°", esito: "lievemente sintomatico" },

                { min: 2, max: 2, stat: "89°", esito: "" },
                { min: 1, max: 1, stat: "83°", esito: "" },

                { min: 0, max: 0, stat: "1–75°", esito: "" },
            ],

        SCT_punteggio: [
            { min: 29, max: 36, stat: "99°", esito: "fortemente sintomatico" },
            { min: 27, max: 28, stat: "98°", esito: "moderatamente sintomatico" },

            { min: 26, max: 26, stat: "97°", esito: "moderatamente sintomatico" },
            { min: 25, max: 25, stat: "96°", esito: "moderatamente sintomatico" },

            { min: 24, max: 24, stat: "95°", esito: "lievemente sintomatico" },
            { min: 23, max: 23, stat: "94°", esito: "lievemente sintomatico" },
            { min: 22, max: 22, stat: "93°", esito: "lievemente sintomatico" },

            { min: 21, max: 21, stat: "92°", esito: "" },
            { min: 20, max: 20, stat: "91°", esito: "" },
            { min: 19, max: 19, stat: "88°", esito: "" },
            { min: 18, max: 18, stat: "85°", esito: "" },
            { min: 17, max: 17, stat: "81°", esito: "" },
            { min: 16, max: 16, stat: "76°", esito: "" },

            { min: 13, max: 15, stat: "51–75°", esito: "" },
            { min: 9, max: 12, stat: "1–50°", esito: "" },
        ],
        SCT_sintomi:
            [
                { min: 7, max: 9, stat: "99°", esito: "fortemente sintomatico" },

                { min: 6, max: 6, stat: "97°", esito: "moderatamente sintomatico" },
                { min: 5, max: 5, stat: "96°", esito: "moderatamente sintomatico" },

                { min: 4, max: 4, stat: "95°", esito: "lievemente sintomatico" },
                { min: 3, max: 3, stat: "93°", esito: "lievemente sintomatico" },

                { min: 2, max: 2, stat: "88°", esito: "" },
                { min: 1, max: 1, stat: "83°", esito: "" },

                { min: 0, max: 0, stat: "1–75°", esito: "" },
            ],

        totale_adhd_punteggio: [
            { min: 47, max: 72, stat: "99°", esito: "fortemente sintomatico" },
            { min: 44, max: 46, stat: "98°", esito: "moderatamente sintomatico" },

            { min: 43, max: 43, stat: "97°", esito: "moderatamente sintomatico" },
            { min: 42, max: 42, stat: "96°", esito: "moderatamente sintomatico" },

            { min: 41, max: 41, stat: "95°", esito: "lievemente sintomatico" },
            { min: 40, max: 40, stat: "94°", esito: "lievemente sintomatico" },
            { min: 39, max: 39, stat: "93°", esito: "lievemente sintomatico" },

            { min: 38, max: 38, stat: "92°", esito: "" },
            { min: 37, max: 37, stat: "91°", esito: "" },
            { min: 36, max: 36, stat: "90°", esito: "" },
            { min: 35, max: 35, stat: "89°", esito: "" },
            { min: 34, max: 34, stat: "88°", esito: "" },
            { min: 33, max: 33, stat: "85°", esito: "" },
            { min: 32, max: 32, stat: "83°", esito: "" },
            { min: 31, max: 31, stat: "80°", esito: "" },

            { min: 26, max: 30, stat: "51–75°", esito: "" },
            { min: 18, max: 25, stat: "1–50°", esito: "" },
        ],

        totale_adhd_sintomi: [
            { min: 11, max: 18, stat: "99°", esito: "fortemente sintomatico" },

            { min: 9, max: 10, stat: "98°", esito: "moderatamente sintomatico" },
            { min: 8, max: 8, stat: "97°", esito: "moderatamente sintomatico" },
            { min: 7, max: 7, stat: "96°", esito: "moderatamente sintomatico" },

            { min: 6, max: 6, stat: "92°", esito: "" },
            { min: 5, max: 5, stat: "91°", esito: "" },
            { min: 4, max: 4, stat: "90°", esito: "" },
            { min: 3, max: 3, stat: "84°", esito: "" },
            { min: 2, max: 2, stat: "78°", esito: "" },
            { min: 1, max: 1, stat: "77°", esito: "" },

            { min: 0, max: 1, stat: "1–75°", esito: "" },
        ]

    },

    // ✅ placeholders — fill later with real sheet values
    "40-59": {
        disattenzione_punteggio: [
            { min: 20, max: 36, stat: "99°", esito: "fortemente sintomatico" },
            { min: 19, max: 19, stat: "98°", esito: "moderatamente sintomatico" },
            { min: 18, max: 18, stat: "97°", esito: "moderatamente sintomatico" },

            { min: 17, max: 17, stat: "95°", esito: "lievemente sintomatico" },
            { min: 16, max: 16, stat: "94°", esito: "lievemente sintomatico" },
            { min: 15, max: 15, stat: "93°", esito: "lievemente sintomatico" },

            { min: 14, max: 14, stat: "77°", esito: "" },

            { min: 12, max: 13, stat: "51–75°", esito: "" },
            { min: 9, max: 11, stat: "1–50°", esito: "" },
        ],

        disattenzione_sintomi: [
            { min: 4, max: 9, stat: "99°", esito: "fortemente sintomatico" },

            { min: 3, max: 3, stat: "98°", esito: "moderatamente sintomatico" },
            { min: 2, max: 2, stat: "97°", esito: "moderatamente sintomatico" },

            // table-এ 96–93 row-এ value নেই → skip

            { min: 1, max: 1, stat: "91°", esito: "" },
            { min: 0, max: 0, stat: "1–75°", esito: "" },
        ],


        iperattivita_punteggio: [
            { min: 12, max: 20, stat: "99°", esito: "fortemente sintomatico" },
            { min: 11, max: 11, stat: "98°", esito: "moderatamente sintomatico" },
            { min: 10, max: 10, stat: "97°", esito: "moderatamente sintomatico" },

            { min: 9, max: 9, stat: "93°", esito: "lievemente sintomatico" },

            { min: 8, max: 8, stat: "88°", esito: "" },

            { min: 6, max: 6, stat: "51–75°", esito: "" },
            { min: 5, max: 5, stat: "1–50°", esito: "" },
        ],

        impulsivita_punteggio: [
            { min: 10, max: 16, stat: "99°", esito: "fortemente sintomatico" },

            { min: 9, max: 9, stat: "97°", esito: "moderatamente sintomatico" },

            { min: 8, max: 8, stat: "95°", esito: "lievemente sintomatico" },
            { min: 7, max: 7, stat: "94°", esito: "lievemente sintomatico" },

            { min: 5, max: 6, stat: "51–75°", esito: "" },
            { min: 4, max: 4, stat: "1–50°", esito: "" },
        ],

        iperattivita_impulsivita_sintomi:
            [
                { min: 3, max: 9, stat: "99°", esito: "fortemente sintomatico" },

                { min: 2, max: 2, stat: "98°", esito: "moderatamente sintomatico" },

                // 97–93 rows empty

                { min: 1, max: 1, stat: "86°", esito: "" },
                { min: 0, max: 0, stat: "1–75°", esito: "" },
            ],

        SCT_punteggio: [
            { min: 25, max: 36, stat: "99°", esito: "fortemente sintomatico" },
            { min: 22, max: 24, stat: "98°", esito: "moderatamente sintomatico" },
            { min: 19, max: 21, stat: "97°", esito: "moderatamente sintomatico" },

            { min: 18, max: 18, stat: "96°", esito: "moderatamente sintomatico" },

            // 95/94/93 এই টেবিলে SCT কলামে মান ছিল না (ফাঁকা), তাই বাদ
            { min: 17, max: 17, stat: "92°", esito: "" },
            { min: 16, max: 16, stat: "88°", esito: "" },
            { min: 15, max: 15, stat: "85°", esito: "" },
            { min: 14, max: 14, stat: "80°", esito: "" },

            { min: 11, max: 13, stat: "51–75°", esito: "" },
            { min: 9, max: 10, stat: "1–50°", esito: "" },
        ],
        SCT_sintomi:
            [
                { min: 6, max: 9, stat: "99°", esito: "fortemente sintomatico" },

                { min: 4, max: 5, stat: "98°", esito: "moderatamente sintomatico" },
                { min: 3, max: 3, stat: "97°", esito: "moderatamente sintomatico" },
                { min: 2, max: 2, stat: "94°", esito: "lievemente sintomatico" },
                { min: 1, max: 1, stat: "86°", esito: "" },

                { min: 0, max: 0, stat: "1–75°", esito: "" },
            ],

        totale_adhd_punteggio: [
            { min: 40, max: 72, stat: "99°", esito: "fortemente sintomatico" },
            { min: 37, max: 39, stat: "98°", esito: "moderatamente sintomatico" },
            { min: 34, max: 36, stat: "97°", esito: "moderatamente sintomatico" },

            { min: 33, max: 33, stat: "96°", esito: "moderatamente sintomatico" },

            { min: 32, max: 32, stat: "95°", esito: "lievemente sintomatico" },
            { min: 31, max: 31, stat: "94°", esito: "lievemente sintomatico" },
            { min: 30, max: 30, stat: "93°", esito: "lievemente sintomatico" },

            { min: 28, max: 28, stat: "85°", esito: "" },
            { min: 27, max: 27, stat: "80°", esito: "" },

            { min: 24, max: 26, stat: "51–75°", esito: "" },
            { min: 18, max: 23, stat: "1–50°", esito: "" },
        ],

        totale_adhd_sintomi: [
            { min: 7, max: 18, stat: "99°", esito: "fortemente sintomatico" },

            { min: 5, max: 6, stat: "98°", esito: "moderatamente sintomatico" },
            { min: 3, max: 4, stat: "97°", esito: "moderatamente sintomatico" },

            { min: 2, max: 2, stat: "94°", esito: "lievemente sintomatico" },

            // 93–88 rows empty

            { min: 1, max: 1, stat: "89°", esito: "" },
            { min: 0, max: 0, stat: "1–75°", esito: "" },
        ]

    },

    "60-89": {
        disattenzione_punteggio: [
            { min: 23, max: 36, stat: "99°", esito: "fortemente sintomatico" },
            { min: 21, max: 22, stat: "98°", esito: "moderatamente sintomatico" },

            { min: 20, max: 20, stat: "96°", esito: "moderatamente sintomatico" },
            { min: 19, max: 19, stat: "95°", esito: "lievemente sintomatico" },
            { min: 18, max: 18, stat: "93°", esito: "lievemente sintomatico" },

            { min: 17, max: 17, stat: "92°", esito: "" },
            { min: 16, max: 16, stat: "91°", esito: "" },
            { min: 15, max: 15, stat: "89°", esito: "" },

            { min: 13, max: 14, stat: "51–75°", esito: "" },
            { min: 9, max: 12, stat: "1–50°", esito: "" },
        ],

        disattenzione_sintomi: [
            { min: 6, max: 9, stat: "99°", esito: "fortemente sintomatico" },
            { min: 4, max: 5, stat: "98°", esito: "moderatamente sintomatico" },

            { min: 3, max: 3, stat: "96°", esito: "moderatamente sintomatico" },
            { min: 2, max: 2, stat: "91°", esito: "" },
            { min: 1, max: 1, stat: "83°", esito: "" },

            { min: 0, max: 0, stat: "1–75°", esito: "" },
        ],


        iperattivita_punteggio: [
            { min: 11, max: 20, stat: "99°", esito: "fortemente sintomatico" },

            { min: 10, max: 10, stat: "96°", esito: "moderatamente sintomatico" },
            { min: 9, max: 9, stat: "89°", esito: "" },
            { min: 8, max: 8, stat: "88°", esito: "" },
            { min: 7, max: 7, stat: "84°", esito: "" },
            { min: 6, max: 6, stat: "77°", esito: "" },

            { min: 5, max: 5, stat: "1–50°", esito: "" },
        ],

        impulsivita_punteggio: [
            { min: 10, max: 16, stat: "99°", esito: "fortemente sintomatico" },

            { min: 9, max: 9, stat: "96°", esito: "moderatamente sintomatico" },
            { min: 8, max: 8, stat: "93°", esito: "lievemente sintomatico" },
            { min: 7, max: 7, stat: "84°", esito: "" },
            { min: 6, max: 6, stat: "77°", esito: "" },

            { min: 5, max: 5, stat: "1–50°", esito: "" },
        ],

        iperattivita_impulsivita_sintomi:
            [
                { min: 4, max: 9, stat: "99°", esito: "fortemente sintomatico" },
                { min: 2, max: 3, stat: "98°", esito: "moderatamente sintomatico" },

                { min: 1, max: 1, stat: "91°", esito: "" },
                { min: 0, max: 0, stat: "1–75°", esito: "" },
            ],

        SCT_punteggio: [
            { min: 24, max: 36, stat: "99°", esito: "fortemente sintomatico" },
            { min: 18, max: 23, stat: "98°", esito: "moderatamente sintomatico" },

            { min: 16, max: 16, stat: "88°", esito: "" },
            { min: 15, max: 15, stat: "84°", esito: "" },

            { min: 12, max: 14, stat: "51–75°", esito: "" },
            { min: 9, max: 11, stat: "1–50°", esito: "" },
        ],
        SCT_sintomi:
            [
                { min: 6, max: 9, stat: "99°", esito: "fortemente sintomatico" },
                { min: 2, max: 5, stat: "98°", esito: "moderatamente sintomatico" },

                { min: 1, max: 1, stat: "84°", esito: "" },
                { min: 0, max: 0, stat: "1–75°", esito: "" },
            ],

        totale_adhd_punteggio: [
            { min: 40, max: 72, stat: "99°", esito: "fortemente sintomatico" },
            { min: 36, max: 39, stat: "98°", esito: "moderatamente sintomatico" },

            { min: 35, max: 35, stat: "96°", esito: "moderatamente sintomatico" },
            { min: 34, max: 34, stat: "95°", esito: "lievemente sintomatico" },
            { min: 33, max: 33, stat: "93°", esito: "lievemente sintomatico" },

            { min: 32, max: 32, stat: "89°", esito: "" },
            { min: 31, max: 31, stat: "88°", esito: "" },
            { min: 30, max: 30, stat: "87°", esito: "" },
            { min: 29, max: 29, stat: "86°", esito: "" },
            { min: 28, max: 28, stat: "84°", esito: "" },
            { min: 27, max: 27, stat: "82°", esito: "" },

            { min: 24, max: 26, stat: "51–75°", esito: "" },
            { min: 18, max: 23, stat: "1–50°", esito: "" },
        ],

        totale_adhd_sintomi: [
            { min: 8, max: 18, stat: "99°", esito: "fortemente sintomatico" },
            { min: 5, max: 7, stat: "98°", esito: "moderatamente sintomatico" },

            { min: 4, max: 4, stat: "95°", esito: "lievemente sintomatico" },
            { min: 3, max: 3, stat: "93°", esito: "lievemente sintomatico" },

            { min: 2, max: 2, stat: "89°", esito: "" },
            { min: 1, max: 1, stat: "84°", esito: "" },

            { min: 0, max: 0, stat: "1–75°", esito: "" },
        ]

    },
};

// ===============================
// ✅ HELPERS
// ===============================

function pickAgeBand(age: number): AgeBandKey {
  if (age >= 18 && age <= 39) return "18-39";
  if (age >= 40 && age <= 59) return "40-59";
  return "60-89";
}

function classify(score: number, rows: RangeRow[]): { stat: Stat; esito: Esito } {
  for (const r of rows) {
    if (score >= r.min && score <= r.max) return { stat: r.stat, esito: r.esito };
  }
  return { stat: "", esito: "" };
}


/**
 * UI sometimes sends:
 * - "Mai o raramente__0"
 * - "1__0"
 * - { label: "Mai o raramente" }
 * - { value: 1 } / { id: 1 }
 * - 1
 */
function stripUiSuffix(v: unknown) {
  if (typeof v !== "string") return v;
  return v.split("__")[0].trim();
}

function toScore(ans: any): number {
  if (ans == null) return 0;

  if (typeof ans === "number") return Number.isFinite(ans) ? ans : 0;

  if (typeof ans === "string") {
    const s0 = String(stripUiSuffix(ans));
    const n = Number(s0);
    if (!Number.isNaN(n) && Number.isFinite(n)) return n;
    return scoreFromLabel(s0);
  }

  if (typeof ans === "object") {
    const val = (ans as any).value ?? (ans as any).id ?? null;
    if (val != null) {
      const v0 = stripUiSuffix(val);
      const n = Number(v0);
      if (!Number.isNaN(n) && Number.isFinite(n)) return n;
    }
    const lab = (ans as any).label ?? null;
    if (lab != null) return scoreFromLabel(String(stripUiSuffix(lab)));
  }

  return 0;
}

function envToString(envRaw: any): string {
  if (!Array.isArray(envRaw)) return "";
  return envRaw
    .map((x) => {
      if (x == null) return "";
      if (typeof x === "string" || typeof x === "number") return String(stripUiSuffix(x));
      if (typeof x === "object") {
        const lab = (x as any).label ?? (x as any).value ?? (x as any).id ?? "";
        return String(stripUiSuffix(lab));
      }
      return "";
    })
    .filter(Boolean)
    .join(", ");
}

// ✅ TEXT helper (MULTI এর envToString() এর মতো use করবে)
function textToString(raw: any): string {
  if (raw == null) return "";

  // already string/number
  if (typeof raw === "string" || typeof raw === "number") {
    const s = String(stripUiSuffix(raw)).trim();
    return s;
  }

  // object cases (sometimes UI sends {label}, {value}, {id})
  if (typeof raw === "object") {
    const val =
      (raw as any).value ??
      (raw as any).id ??
      (raw as any).label ??
      "";
    const s = String(stripUiSuffix(val)).trim();
    return s;
  }

  return "";
}



// ===============================
// ✅ COMPUTE (with age + STAT/ESITO)
// ===============================

export type ComputeCtx = { patientAge?: number | null };

export function computeBAARSIVSelf(answers: Record<string, any>, ctx?: ComputeCtx) {
  const start_1_9: number[] = [];
  const start_10_14: number[] = [];
  const start_15_18: number[] = [];
  const start_19_27: number[] = [];

  for (let i = 1; i <= 9; i++) start_1_9.push(toScore(answers[qKey(i)]));
  for (let i = 10; i <= 14; i++) start_10_14.push(toScore(answers[qKey(i)]));
  for (let i = 15; i <= 18; i++) start_15_18.push(toScore(answers[qKey(i)]));
  for (let i = 19; i <= 27; i++) start_19_27.push(toScore(answers[qKey(i)]));
  
  const diso_punt_1_9 = start_1_9.reduce((a, b) => a + b, 0);
  const diso_sint_1_9 = start_1_9.filter((v) => v >= 3).length;

  const iper_punt_10_14 = start_10_14.reduce((a, b) => a + b, 0);
  const iper_sint_10_14 = start_10_14.filter((v) => v >= 3).length;

  const impu_punt_15_18 = start_15_18.reduce((a, b) => a + b, 0);
  const impu_sint_15_18 = start_15_18.filter((v) => v >= 3).length;

  const sct_punt_19_27 = start_19_27.reduce((a, b) => a + b, 0);
  const sct_sint_19_27 = start_19_27.filter((v) => v >= 3).length;

  const totalScoreComputed = diso_punt_1_9 + iper_punt_10_14;
  const totalSymptomsComputed = diso_sint_1_9 + impu_sint_15_18;
  const iperattivitaImpulsivitaSintomiComputed= iper_sint_10_14 + impu_sint_15_18 ;

  const age = Number(ctx?.patientAge ?? 0);
  const band = pickAgeBand(age);
  const norms = BAARS_CHILDHOOD_NORMS[band];

  const disaPunteggio = classify(diso_punt_1_9, norms.disattenzione_punteggio);
  const iperPunteggio = classify(iper_punt_10_14, norms.iperattivita_punteggio);
  const impuPunteggio = classify(impu_punt_15_18, norms.impulsivita_punteggio);
  const sctPunteggio = classify(sct_punt_19_27, norms.SCT_punteggio);
  const totalPunteggio = classify(totalScoreComputed, norms.totale_adhd_punteggio);
  
  const disaSintomi = classify(diso_sint_1_9, norms.disattenzione_sintomi);
  const iperattivita_ImpulsivitaiSintomi = classify(iperattivitaImpulsivitaSintomiComputed, norms.iperattivita_impulsivita_sintomi);
  const totalSintomi = classify(totalSymptomsComputed, norms.totale_adhd_sintomi);
  const sctSintomi = classify(sct_punt_19_27, norms.SCT_sintomi);

  const env = envToString(answers[qKey(29)]);
  const onset = textToString(answers[qKey(28)]) || "—";



 return {
    "Disattenzione punteggio PG": String(diso_punt_1_9),
    "Disattenzione punteggio STAT": disaPunteggio.stat,
    "Disattenzione punteggio ESITO": disaPunteggio.esito,

    "Disattenzione n° sintomi PG": String(diso_sint_1_9),
    "Disattenzione n° sintomi STAT": disaSintomi.stat,
    "Disattenzione n° sintomi ESITO": disaSintomi.esito,

    "Iperattività punteggio PG": String(iper_punt_10_14),
    "Iperattività sintomi PG": String(iper_sint_10_14),
    "Iperattività punteggio STAT": impuPunteggio.stat,
    "Iperattività punteggio ESITO": impuPunteggio.esito,

    "n° sintomi iperattività/impulsività PG": String(iperattivitaImpulsivitaSintomiComputed),
    "n° sintomi iperattività/impulsività STAT": iperattivita_ImpulsivitaiSintomi.stat,
    "n° sintomi iperattività/impulsività ESITO": iperattivita_ImpulsivitaiSintomi.esito,

    "Impulsività punteggio PG": String(impu_punt_15_18),
    "Impulsività sintomi PG": String(impu_sint_15_18),
    "Impulsività punteggio STAT": impuPunteggio.stat,
    "Impulsività punteggio ESITO": impuPunteggio.esito,

    "SCT punteggio PG": String(sct_punt_19_27),
    "SCT punteggio STAT": sctPunteggio.stat,
    "SCT punteggio ESITO": sctPunteggio.esito,

    "SCT sintomi PG": String(sct_sint_19_27),
    "SCT sintomi STAT": sctSintomi.stat,
    "SCT sintomi ESITO": sctSintomi.esito,

    // For ADHD total score, returning 0 for now (you can adjust this later with the actual calculation)
    "Totale ADHD punteggio PG": String(totalScoreComputed),  // If you have a calculation for this, update it
    "Totale ADHD punteggio STAT": totalPunteggio.stat,
    "Totale ADHD punteggio ESITO": totalPunteggio.esito,

    "Totale ADHD n° sintomi PG": String(totalSymptomsComputed),  // Same for symptoms, replace 0 if needed
    "Totale ADHD n° sintomi STAT": totalSintomi.stat,
    "Totale ADHD n° sintomi ESITO": totalSintomi.esito,

    // Debug info (optional)
    // "Totale ADHDpunteggio PG": String(totalScoreComputed),
    // "Totale ADHD n°sintomi PG": String(totalSymptomsComputed),

    "Età inizio sintomi TEXT": onset,
    "Ambiti di compromissione MULTI": env,
    "Norms age band": band,
  };
}
