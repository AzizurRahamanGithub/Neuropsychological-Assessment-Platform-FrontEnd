import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS = [
  { label: "Vero ora e quando ero giovane", value: 3 },
  { label: "Vero solo ora", value: 2 },
  { label: "Vero solo quando ero giovane (<16 anni)", value: 1 },
  { label: "Mai vero", value: 0 },
] as const;

const QUESTIONS_1_80: string[] = [
  "Sono una persona amichevole: gradevole, gioviale, affettuosa con gli altri.",
  "Uso spesso parole o frasi tratte da film e televisione durante le conversazioni.",
  "Sono spesso sorpreso quando gli altri mi dicono che sono stato insensibile o maleducato.",
  "A volte parlo a voce troppo alta o troppo bassa e non me ne accorgo.",
  "Spesso non so come comportarmi nelle situazioni sociali.",
  "Sono capace a mettermi 'nei panni degli altri'",
  "A volte ho difficoltà a capire cosa significano frasi come: 'sei la luce dei miei occhi'",
  "Mi piace parlare solo con le persone che condividono i miei interessi speciali.",
  "Mi focalizzo sui dettagli invece che sull'idea generale.",
  "Noto sempre la sensazione fisica che mi dà il cibo in bocca. Questo per me è più importante che il sapore.",
  "Mi mancano i miei migliori amici o la famiglia quando siamo distanti per lungo tempo.",
  "A volte offendo gli altri dicendo quello che penso, anche se non ne ho intenzione.",
  "Mi piace pensare e parlare solo di quelle poche cose che mi interessano.",
  "Se devo andare a mangiare al ristorante, preferisco andarci da solo piuttosto che con qualcuno che conosco.",
  "Non saprei immaginare come sarebbe essere qualcun altro.",
  "Mi è stato detto che sono goffo o scoordinato.",
  "Gli altri mi considerano strano e diverso.",
  "Capisco quando gli amici hanno bisogno di conforto.",
  "Sono ipersensibile alla sensazione tattile causata dai vestiti sulla mia pelle. Come li sento addosso è più importante di come appaiano esteriormente.",
  "Preferisco copiare il modo in cui certe persone parlano o si comportano. Mi aiuta a sembrare più normale.",
  "Posso provare una forte ansia se devo parlare con più di una persona contemporaneamente.",
  "Devo 'agire come una persona normale' per accontentare gli altri e farmi accettare.",
  "Di solito per me è facile conoscere nuove persone.",
  "Mi confonde (perdo il filo del discorso) quando qualcuno mi interrompe mentre sto parlando di qualcosa per me molto interessante.",
  "È difficile per me capire cosa provano le altre persone mentre stiamo parlando.",
  "Mi piace avere una conversazione con molte persone contemporaneamente, ad esempio a pranzo, a scuola o al lavoro.",
  "Prendo le cose troppo letteralmente, quindi spesso non colgo cosa le persone intendono dire.",
  "Per me è molto difficile capire il motivo per cui una persona è imbarazzata o gelosa.",
  "Alcuni tessuti comuni che non danno fastidio agli altri, mi procurano molto fastidio quando toccano la mia pelle.",
  "Mi agito molto quando sono obbligato a cambiare improvvisamente il modo abituale con cui faccio le cose.",
  "Non ho mai voluto avere o ho sentito il bisogno di una relazione che le altre persone chiamano 'intima'.",
  "Per me è difficile sia iniziare che terminare una conversazione. Sento il bisogno di proseguire finché non ho finito.",
  "Parlo con un ritmo di voce normale.",
  "Lo stesso suono, colore o tessuto può passare improvvisamente dal provocarmi forti reazioni fisiche o emotive all'essermi indifferente (e viceversa).",
  "La frase 'ti sento dentro' mi provoca una sensazione di disagio.",
  "A volte il suono di una parola o un rumore acuto possono essere dolorosi per le mie orecchie.",
  "Sono disponibile a comprendere le ragioni degli altri.",
  "Non mi immedesimo emotivamente con i protagonisti dei film e non riesco a provare ciò che loro provano.",
  "Non so capire quando qualcuno sta flirtando con me.",
  "Sono in grado di visualizzare nei minimi dettagli ciò che mi interessa.",
  "Tengo liste di cose che mi interessano, anche se non hanno uno uso pratico (es. statistiche sportive, calendari, fatti storici, date, ecc.).",
  "Troppi stimoli sensoriali mi sovraccaricano e mi sento schiacciato. Per stare meglio ho bisogno di isolarmi.",
  "Mi piace discutere di diversi argomenti con i miei amici.",
  "Non sono in grado di capire se qualcuno è interessato o annoiato da quello di cui sto parlando.",
  "Mi risulta molto difficile interpretare le espressioni del viso e il linguaggio del corpo delle persone con cui sto parlando.",
  "Le stesse cose (come i vestiti o la temperatura) possono darmi sensazioni molto diverse in momenti differenti.",
  "Mi trovo molto a mio agio durante un appuntamento o nelle situazioni sociali.",
  "Quando le persone mi parlano dei loro problemi, cerco di aiutarle al meglio delle mie possibilità.",
  "Mi è stato detto che ho una voce strana (ad esempio piatta, monotona, infantile, acuta, ecc.).",
  "A volte un pensiero o un argomento mi si fissa nella mente a tal punto che non riesco a fare a meno di parlarne anche se nessuno sembra interessato.",
  "Tendo a fare in continuazione movimenti particolari con le mani (come sfarfallare, rigirare lacci o bastoncini, muoverle davanti ai miei occhi, ecc.).",
  "Non sono mai stato interessato agli argomenti considerati interessanti dalla maggioranza delle persone.",
  "Sono considerata una persona compassionevole: se vedo qualcuno stare male provo anche io una sensazione di sofferenza e il desiderio di aiutarlo.",
  "Quando sto insieme agli altri seguo un insieme specifico di regole che mi aiutano a sembrare normale.",
  "Per me è molto difficile lavorare e sentirmi a mio agio in un gruppo.",
  "Quando parlo con qualcuno, è difficile cambiare l'argomento della conversazione. Quando lo fa la persona con cui sto parlando posso diventare molto agitato e confuso.",
  "A volte ho bisogno di coprirmi le orecchie per bloccare rumori fastidiosi (come aspirapolveri o persone che parlano troppo o sono troppo rumorose).",
  "Sono in grado di parlare facilmente con le persone e fare chiacchiere di cortesia.",
  "A volte non provo dolore per cose che lo provocano negli altri (per esempio quando mi faccio male da solo o mi brucio una mano su una pentola bollente).",
  "Quando parlo con qualcuno, trovo molto difficile capire quando è il mio turno di parlare e quando quello di ascoltare.",
  "Chi mi conosce bene mi considera un solitario.",
  "Solitamente parlo con un tono di voce normale.",
  "Mi piace che le cose siano esattamente le stesse, giorno dopo giorno, anche piccoli cambiamenti nelle mie routine mi agitano.",
  "Per me è un mistero come fare amici e socializzare.",
  "Mi calma girare su me stesso o dondolarmi su una sedia quando sono stressato.",
  "La frase 'gli ha parlato con il cuore in mano' non ha senso per me.",
  "Se sono in un ambiente in cui ci sono molti odori, sensazioni tattili, rumori e luci brillanti, mi sento ansioso o spaventato.",
  "Sono in grado di capire quando qualcuno intende comunicare una cosa diversa da quella che dice a parole.",
  "Mi piace stare per conto mio più tempo possibile.",
  "I miei pensieri sono conservati nella memoria come fossero schede di un archivio, quando devo prendere quelli che mi interessano cerco all'interno dello schedario per trovare quello giusto (o qualsiasi altro modo unico di pensare).",
  "Lo stesso suono sembra a volte molto rumoroso e altre molto leggero anche se sono consapevole che non è cambiato.",
  "Mi piace trascorrere il mio tempo mangiando e parlando con familiari ed amici.",
  "Non riesco a tollerare le cose che non mi piacciono (come odori, tessuti, suoni o colori).",
  "Non mi piace essere abbracciato o ricevere altre manifestazioni fisiche di affetto.",
  "Quando devo andare da qualche parte ho bisogno di seguire una strada familiare, altrimenti posso sentirmi molto confuso ed agitato.",
  "È difficile immaginare ciò che gli altri si aspettano da me.",
  "Mi piace avere amici intimi.",
  "Le persone mi dicono che fornisco spesso troppi dettagli.",
  "Mi dicono spesso che faccio domande imbarazzanti.",
  "Tendo a puntualizzare gli errori degli altri.",
];

// Reverse-scored items (items that indicate positive social/emotional functioning)
// Based on the Excel file scoring patterns: items 1, 6, 11, 18, 23, 26, 33, 37, 43, 47, 48, 53, 58, 62, 68, 72, 77
const REVERSE_ITEMS: number[] = [
  1, 6, 11, 18, 23, 26, 33, 37, 43, 47, 48, 53, 58, 62, 68, 72, 77,
];

const questions: Question[] = QUESTIONS_1_80.map(
  (text, i) =>
    ({
      key: `q${i + 1}`,
      number: i + 1,
      text,
      type: "single_choice",
      required: true,
      options: [...OPTIONS],
    }) satisfies Question,
);

export const RAADS_R_SELF: QuestionnaireDef = {
  code: "RAADS_R_SELF",
  formCode: "RAADS_R_SELF",
  type: "SELF",
  name: "RAADS_R_SELF",
  instruction:
    "Qui di seguito troverà alcune esperienze di vita e caratteristiche della personalità che potrebbero applicarsi a Lei. Selezioni per favore la risposta che meglio si adatta alle Sue esperienze personali.",
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito = "sintomatico" | "";

/**
 * UI sometimes sends:
 * - "Vero ora e quando ero giovane__0"
 * - "3__0"
 * - { label: "Vero ora e quando ero giovane" }
 * - { value: 3 } / { id: 0 }
 * - 3
 */
function stripUiSuffix(v: unknown) {
  if (typeof v !== "string") return v;
  return v.split("__")[0].trim();
}

function toScore(ans: any, questionNumber: number): number {
  if (ans == null) return 0;

  // Determine if this question needs reverse scoring
  const needsReverse = REVERSE_ITEMS.includes(questionNumber);

  let rawScore = 0;

  if (typeof ans === "number") {
    rawScore = Number.isFinite(ans) ? ans : 0;
  } else if (typeof ans === "string") {
    const s0 = String(stripUiSuffix(ans));
    const n = Number(s0);
    if (!Number.isNaN(n) && Number.isFinite(n)) {
      rawScore = n;
    } else {
      rawScore = scoreFromLabel(s0);
    }
  } else if (typeof ans === "object") {
    const val = (ans as any).value ?? (ans as any).id ?? null;
    if (val != null) {
      const v0 = stripUiSuffix(val);
      const n = Number(v0);
      if (!Number.isNaN(n) && Number.isFinite(n)) {
        rawScore = n;
      }
    }
    const lab = (ans as any).label ?? null;
    if (lab != null && rawScore === 0) {
      rawScore = scoreFromLabel(String(stripUiSuffix(lab)));
    }
  }

  // Apply reverse scoring if needed
  if (needsReverse) {
    // Reverse: 0→3, 1→2, 2→1, 3→0
    return 3 - rawScore;
  }

  return rawScore;
}

// ===============================
// COMPUTE
// ===============================

export function computeRAADSRSelf(answers: Record<string, any>) {
  // Get scores for all 80 questions
  const scores: number[] = [];
  for (let i = 1; i <= 80; i++) {
    scores.push(toScore(answers[qKey(i)], i));
  }

  // Scala totale: sum of all items
  const scala_totale = scores.reduce((a, b) => a + b, 0);

  // Interazione sociale: items 1,3,5,6,8,11,12,14,17,18,20,21,22,23,25,26,28,31,37,38,39,43,44,45,47,48,53,54,55,60,61,64,68,69,72,76,77,79,80
  const interazione_sociale_items = [
    1, 3, 5, 6, 8, 11, 12, 14, 17, 18, 20, 21, 22, 23, 25, 26, 28, 31, 37, 38,
    39, 43, 44, 45, 47, 48, 53, 54, 55, 60, 61, 64, 68, 69, 72, 76, 77, 79, 80,
  ];
  const interazione_sociale_punteggio = interazione_sociale_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Interessi circoscritti: items 9,13,24,30,32,40,41,50,52,56,63,70,75,78
  const interessi_circoscritti_items = [
    9, 13, 24, 30, 32, 40, 41, 50, 52, 56, 63, 70, 75, 78,
  ];
  const interessi_circoscritti_punteggio = interessi_circoscritti_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Pragmatica: items 2,7,15,27,35,58,66
  const pragmatica_items = [2, 7, 15, 27, 35, 58, 66];
  const pragmatica_punteggio = pragmatica_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Senso-motorio: items 4,10,16,19,29,33,34,36,42,46,49,51,57,59,62,65,67,71,73,74
  const senso_motorio_items = [
    4, 10, 16, 19, 29, 33, 34, 36, 42, 46, 49, 51, 57, 59, 62, 65, 67, 71, 73,
    74,
  ];
  const senso_motorio_punteggio = senso_motorio_items
    .map((i) => scores[i - 1])
    .reduce((a, b) => a + b, 0);

  // Determine ESITO based on thresholds
  function getEsitoScalaTotale(score: number): Esito {
    if (score >= 65) return "sintomatico";
    return "";
  }

  function getEsitoInterazioneSociale(score: number): Esito {
    if (score >= 31) return "sintomatico";
    return "";
  }

  function getEsitoInteressiCircoscritti(score: number): Esito {
    if (score >= 15) return "sintomatico";
    return "";
  }

  function getEsitoPragmatica(score: number): Esito {
    if (score >= 4) return "sintomatico";
    return "";
  }

  function getEsitoSensoMotorio(score: number): Esito {
    if (score >= 16) return "sintomatico";
    return "";
  }

  return {
    // Total scale
    "Scala totale PG": String(scala_totale),
    "Scala totale ESITO": getEsitoScalaTotale(scala_totale),

    // Subscales
    "Interazione sociale PG": String(interazione_sociale_punteggio),
    "Interazione sociale ESITO": getEsitoInterazioneSociale(
      interazione_sociale_punteggio,
    ),

    "Interessi circoscritti PG": String(interessi_circoscritti_punteggio),
    "Interessi circoscritti ESITO": getEsitoInteressiCircoscritti(
      interessi_circoscritti_punteggio,
    ),

    "Pragmatica PG": String(pragmatica_punteggio),
    "Pragmatica ESITO": getEsitoPragmatica(pragmatica_punteggio),

    "Senso-motorio PG": String(senso_motorio_punteggio),
    "Senso-motorio ESITO": getEsitoSensoMotorio(senso_motorio_punteggio),
  };
}
