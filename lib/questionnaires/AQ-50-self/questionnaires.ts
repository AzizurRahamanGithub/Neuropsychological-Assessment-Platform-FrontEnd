import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

const OPTIONS = [
  { label: "Totalmente d'accordo", value: 1 },
  { label: "Parzialmente d'accordo", value: 1 },
  { label: "Parzialmente in disaccordo", value: 0 },
  { label: "Totalmente in disaccordo", value: 0 },
] as const;

const QUESTIONS_1_50: string[] = [
  "Preferisco fare le cose in compagnia anziché da solo.",
  "Preferisco fare le cose sempre allo stesso modo.",
  "Se tento di immaginare qualcosa, trovo molto facile creare un'immagine nella mia mente.",
  "Mi capita spesso di essere tanto assorbito da qualcosa da perdere di vista le altre cose.",
  "Spesso avverto suoni deboli di cui gli altri non si accorgono.",
  "Abitualmente presto attenzione ai numeri delle targhe delle auto o a particolari del genere.",
  "Frequentemente le altre persone mi dicono che quello che ho detto è scortese, mentre invece io penso che sia corretto.",
  "Quando leggo una storia, posso facilmente immaginare l'aspetto dei personaggi.",
  "Sono affascinato dalle date.",
  "Nelle occasioni sociali riesco facilmente a seguire le conversazioni di diverse persone.",
  "Nelle situazioni sociali mi sento a mio agio.",
  "Tendo a notare dettagli che gli altri non notano.",
  "Preferisco recarmi in biblioteca piuttosto che ad un party.",
  "Riesco facilmente ad inventare delle storie.",
  "Trovo che mi attirano molto più le persone che le cose.",
  "Tendo ad avere interessi molto forti, e mi disturba fortemente se non posso coltivarli.",
  "Mi piace partecipare alla conversazione.",
  "Quando parlo io, per gli altri non è sempre facile inserirsi nella conversazione.",
  "Sono affascinato dai numeri.",
  "Quando sto leggendo una storia, mi riesce difficile capire le intenzioni dei personaggi.",
  "Non amo particolarmente leggere narrativa.",
  "Mi è difficile farmi dei nuovi amici.",
  "Noto continuamente schemi nelle cose.",
  "Vado più volentieri a teatro che in un museo.",
  "Non mi disturba se viene alterata la mia routine giornaliera.",
  "Mi capita frequentemente di non saper come continuare una conversazione.",
  "Quando qualcuno sta parlando con me, trovo facile 'leggere tra le righe' di ciò che egli/ella sta dicendo.",
  "Di solito io mi concentro più sull'immagine intera che sui piccoli dettagli.",
  "Non sono molto bravo a ricordarmi i numeri telefonici.",
  "Di solito non noto i piccoli cambiamenti in una situazione o nell'aspetto di una persona.",
  "So distinguere se qualcuno che mi ascolta si sta annoiando.",
  "Riesco facilmente a fare più di una cosa allo stesso tempo.",
  "Quando sono al telefono non sono sicuro di quando tocca a me parlare.",
  "Mi piace fare le cose spontaneamente.",
  "Spesso sono l'ultimo ad afferrare il senso di una battuta.",
  "Riesco facilmente a intuire quello che una persona pensa o prova solo guardandola in faccia.",
  "Se mi interrompono mentre sono impegnato a fare qualcosa, riesco a riprendere molto velocemente da dove avevo lasciato.",
  "Riesco bene nella conversazione sociale.",
  "Spesso la gente mi dice che io insisto sempre sullo stesso argomento.",
  "Quando ero piccolo mi piaceva giocare con altri bambini a 'far finta di...'.",
  "Mi piace raccogliere informazioni su categorie di cose (ad es. tipi di auto, tipi di uccelli, tipi di piante, ecc.).",
  "Mi è difficile immaginare come sarebbe la mia vita se io fossi un'altra persona.",
  "Mi piace pianificare attentamente tutte le attività alle quali io partecipo.",
  "Amo le occasioni sociali.",
  "Mi è difficile comprendere le intenzioni della gente.",
  "Le situazioni nuove mi rendono ansioso.",
  "Mi piace incontrare nuove persone.",
  "Sono un buon diplomatico.",
  "Non sono molto bravo a ricordarmi la data di nascita delle persone.",
  "Per me è molto facile giocare coi bambini a 'far finta di…'.",
];

// Reverse-scored items (items that indicate good social/cognitive functioning)
// Items 1, 3, 8, 10, 11, 14, 15, 17, 24, 25, 27, 28, 29, 30, 31, 32, 34, 36, 37, 38, 40, 44, 47, 48, 49, 50
const REVERSE_ITEMS: number[] = [1, 3, 8, 10, 11, 14, 15, 17, 24, 25, 27, 28, 29, 30, 31, 32, 34, 36, 37, 38, 40, 44, 47, 48, 49, 50];

const questions: Question[] = QUESTIONS_1_50.map(
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

export const AQ50_SELF: QuestionnaireDef = {
  code: "AQ50_SELF",
  formCode: "AQ50_SELF",
  type: "SELF",
  name: "AQ50_SELF",
  instruction:
    "In questo questionario le si chiede gentilmente di indicare quanto è d'accordo oppure no con le seguenti affermazioni. Selezioni solo una risposta per ciascuna frase, quella che meglio descrive il suo pensiero.",
  questions,
};

// ===============================
// SCORING LOGIC
// ===============================

type Esito = "sintomatico" | "";

/**
 * UI sometimes sends:
 * - "Totalmente d'accordo__0"
 * - "1__0"
 * - { label: "Totalmente d'accordo" }
 * - { value: 1 } / { id: 0 }
 * - 1
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
    // Reverse: 0→1, 1→0
    return 1 - rawScore;
  }

  return rawScore;
}

// ===============================
// COMPUTE
// ===============================

export function computeAQ50Self(answers: Record<string, any>) {
  // Get scores for all 50 questions
  const scores: number[] = [];
  for (let i = 1; i <= 50; i++) {
    scores.push(toScore(answers[qKey(i)], i));
  }

  // AQ-50 totale: sum of all items
  const aq50_totale = scores.reduce((a, b) => a + b, 0);

  // Determine ESITO based on threshold
  function getEsito(score: number): Esito {
    if (score >= 32) return "sintomatico";
    return "";
  }

  return {
    "AQ-50 totale PG": String(aq50_totale),
    "AQ-50 totale ESITO": getEsito(aq50_totale),
  };
}