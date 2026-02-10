import type { QuestionnaireDef, Question } from "../types";
import { scoreFromLabel, qKey } from "../utils";

// ===============================
// ✅ QUESTIONS + DEF
// ===============================

// Part 1: State Anxiety (Ansia di stato) - Questions 1-20
const OPTIONS_PART1 = [
  { label: "Per nulla", value: 1 },
  { label: "Poco", value: 2 },
  { label: "Abbastanza", value: 3 },
  { label: "Moltissimo", value: 4 },
] as const;

// Part 2: Trait Anxiety (Ansia di tratto) - Questions 21-40
const OPTIONS_PART2 = [
  { label: "Quasi mai", value: 1 },
  { label: "Qualche volta", value: 2 },
  { label: "Spesso", value: 3 },
  { label: "Quasi sempre", value: 4 },
] as const;

// Question texts for Part 1 (State Anxiety)
const PART1_QUESTIONS: string[] = [
  "Mi sento calmo",
  "Mi sento sicuro",
  "Sono teso",
  "Mi sento sotto pressione",
  "Mi sento tranquillo",
  "Mi sento turbato",
  "Sono attualmente preoccupato per possibili disgrazie",
  "Mi sento soddisfatto",
  "Mi sento intimorito",
  "Mi sento a mio agio",
  "Mi sento sicuro di me",
  "Mi sento nervoso",
  "Sono agitato",
  "Mi sento indeciso",
  "Sono rilassato",
  "Mi sento contento",
  "Sono preoccupato",
  "Mi sento confuso",
  "Mi sento disteso",
  "Mi sento bene",
];

// Reverse-scored items for Part 1 (positive items that need reversal)
const PART1_REVERSE: number[] = [1, 2, 5, 8, 10, 11, 15, 16, 19, 20];

// Question texts for Part 2 (Trait Anxiety)
const PART2_QUESTIONS: string[] = [
  "Mi sento bene",
  "Mi sento teso e irrequieto",
  "Sono soddisfatto di me stesso",
  "Vorrei poter essere felice come sembrano essere gli altri",
  "Mi sento un fallito",
  "Mi sento riposato",
  "Io sono calmo, tranquillo e padrone di me",
  "Sento che le difficoltà si accumulano tanto da non poterle superare",
  "Mi preoccupo troppo di cose che in realtà non hanno importanza",
  "Sono felice",
  "Mi vengono pensieri negativi",
  "Manco di fiducia in me stesso",
  "Mi sento sicuro",
  "Prendo decisioni facilmente",
  "Mi sento inadeguato",
  "Sono contento",
  "Pensieri di scarsa importanza mi passano per la mente e mi infastidiscono",
  "Vivo le delusioni con tanta partecipazione da non poter togliermele dalla testa",
  "Sono una persona costante",
  "Divento teso e turbato quando penso alle mie attuali preoccupazioni",
];

// Reverse-scored items for Part 2 (positive items that need reversal)
const PART2_REVERSE: number[] = [21, 23, 26, 27, 30, 33, 34, 36, 39];

const questions: Question[] = [];

// Add Part 1 questions (1-20)
PART1_QUESTIONS.forEach((text, i) => {
  questions.push({
    key: `q${i + 1}`,
    number: i + 1,
    text,
    type: "single_choice",
    required: true,
    options: [...OPTIONS_PART1],
  });
});

// Add instruction for Part 2
questions.push({
  key: "instruction_part2",
  number: null as any,
  text: "Sono qui di seguito riportate alcune frasi che le persone spesso usano per descriversi. Legga ciascuna frase e selezioni come lei abitualmente si sente. Non ci sono risposte giuste o sbagliate. Non impieghi troppo tempo per rispondere alle domande e dia la risposta che le sembra descrivere meglio come lei abitualmente si sente.",
  type: "instruction" as any,
  required: false,
  options: [],
} as any);

// Add Part 2 questions (21-40)
PART2_QUESTIONS.forEach((text, i) => {
  questions.push({
    key: `q${i + 21}`,
    number: i + 21,
    text,
    type: "single_choice",
    required: true,
    options: [...OPTIONS_PART2],
  });
});

export const STAI_OTHER: QuestionnaireDef = {
  code: "STAI_OTHER",
  formCode: "STAI_OTHER",
  type: "OTHER",
  name: "STAI_OTHER",
  instruction:
    "Sono qui di seguito riportate alcune frasi che le persone spesso usano per descriversi. Legga ciascuna frase e selezioni come lei si sente adesso, cioè in questo momento. Non ci sono risposte giuste o sbagliate. Non impieghi troppo tempo per rispondere alle domande e dia la risposta che le sembra descrivere meglio i suoi attuali stati d'animo.",
  questions,
};

// ===============================
// GENDER & AGE-BASED NORMS CONFIG
// ===============================

type Esito = "fortemente sintomatico" | "sintomatico" | "limite" | "";
type Stat = string;

type RangeRow = { min: number; max: number; stat: Stat; esito: Esito };

type AgeGroup = "under_40" | "age_40_49" | "age_50_plus";
type GenderKey = "MALE" | "FEMALE";

type NormsByAgeAndGender = {
  [G in GenderKey]: {
    [A in AgeGroup]: {
      ansia_stato: RangeRow[];
      ansia_tratto: RangeRow[];
    };
  };
};

// ===============================
// ✅ NORMS DATA
// ===============================

const NORMS: NormsByAgeAndGender = {
  MALE: {
    under_40: {
      ansia_stato: [
        { min: 20, max: 20, stat: "1°", esito: "" },
        { min: 21, max: 21, stat: "1°", esito: "" },
        { min: 22, max: 22, stat: "2°", esito: "" },
        { min: 23, max: 23, stat: "4°", esito: "" },
        { min: 24, max: 24, stat: "6°", esito: "" },
        { min: 25, max: 25, stat: "7°", esito: "" },
        { min: 26, max: 26, stat: "10°", esito: "" },
        { min: 27, max: 27, stat: "14°", esito: "" },
        { min: 28, max: 28, stat: "17°", esito: "" },
        { min: 29, max: 29, stat: "22°", esito: "" },
        { min: 30, max: 30, stat: "30°", esito: "" },
        { min: 31, max: 31, stat: "36°", esito: "" },
        { min: 32, max: 32, stat: "41°", esito: "" },
        { min: 33, max: 33, stat: "47°", esito: "" },
        { min: 34, max: 34, stat: "53°", esito: "" },
        { min: 35, max: 35, stat: "58°", esito: "" },
        { min: 36, max: 36, stat: "62°", esito: "" },
        { min: 37, max: 37, stat: "64°", esito: "" },
        { min: 38, max: 38, stat: "67°", esito: "" },
        { min: 39, max: 39, stat: "72°", esito: "" },
        { min: 40, max: 40, stat: "75°", esito: "" },
        { min: 41, max: 41, stat: "77°", esito: "" },
        { min: 42, max: 42, stat: "78°", esito: "" },
        { min: 43, max: 43, stat: "80°", esito: "" },
        { min: 44, max: 44, stat: "83°", esito: "" },
        { min: 45, max: 45, stat: "85°", esito: "limite" },
        { min: 46, max: 46, stat: "86°", esito: "limite" },
        { min: 47, max: 47, stat: "87°", esito: "limite" },
        { min: 48, max: 48, stat: "88°", esito: "limite" },
        { min: 49, max: 49, stat: "90°", esito: "limite" },
        { min: 50, max: 50, stat: "91°", esito: "limite" },
        { min: 51, max: 51, stat: "92°", esito: "limite" },
        { min: 52, max: 52, stat: "93°", esito: "limite" },
        { min: 53, max: 53, stat: "94°", esito: "limite" },
        { min: 54, max: 54, stat: "95°", esito: "sintomatico" },
        { min: 55, max: 55, stat: "95°", esito: "sintomatico" },
        { min: 56, max: 56, stat: "96°", esito: "sintomatico" },
        { min: 57, max: 57, stat: "96°", esito: "sintomatico" },
        { min: 58, max: 58, stat: "97°", esito: "sintomatico" },
        { min: 59, max: 59, stat: "97°", esito: "sintomatico" },
        { min: 60, max: 60, stat: "97°", esito: "sintomatico" },
        { min: 61, max: 61, stat: "98°", esito: "sintomatico" },
        { min: 62, max: 62, stat: "98°", esito: "sintomatico" },
        { min: 63, max: 63, stat: "98°", esito: "sintomatico" },
        { min: 64, max: 64, stat: "99°", esito: "fortemente sintomatico" },
        { min: 65, max: 65, stat: "99°", esito: "fortemente sintomatico" },
        { min: 66, max: 66, stat: "99°", esito: "fortemente sintomatico" },
        { min: 67, max: 67, stat: "99°", esito: "fortemente sintomatico" },
        { min: 68, max: 68, stat: "99°", esito: "fortemente sintomatico" },
        { min: 69, max: 69, stat: "99°", esito: "fortemente sintomatico" },
        { min: 70, max: 70, stat: "99°", esito: "fortemente sintomatico" },
        { min: 71, max: 71, stat: "99°", esito: "fortemente sintomatico" },
        { min: 72, max: 72, stat: "99°", esito: "fortemente sintomatico" },
        { min: 73, max: 73, stat: "99°", esito: "fortemente sintomatico" },
        { min: 74, max: 74, stat: "99°", esito: "fortemente sintomatico" },
        { min: 75, max: 75, stat: "99°", esito: "fortemente sintomatico" },
        { min: 76, max: 76, stat: "99°", esito: "fortemente sintomatico" },
        { min: 77, max: 77, stat: "99°", esito: "fortemente sintomatico" },
        { min: 78, max: 78, stat: "99°", esito: "fortemente sintomatico" },
        { min: 79, max: 79, stat: "99°", esito: "fortemente sintomatico" },
        { min: 80, max: 80, stat: "99°", esito: "fortemente sintomatico" },
      ],
      ansia_tratto: [
        { min: 20, max: 20, stat: "1°", esito: "" },
        { min: 21, max: 21, stat: "1°", esito: "" },
        { min: 22, max: 22, stat: "3°", esito: "" },
        { min: 23, max: 23, stat: "4°", esito: "" },
        { min: 24, max: 24, stat: "6°", esito: "" },
        { min: 25, max: 25, stat: "8°", esito: "" },
        { min: 26, max: 26, stat: "11°", esito: "" },
        { min: 27, max: 27, stat: "14°", esito: "" },
        { min: 28, max: 28, stat: "18°", esito: "" },
        { min: 29, max: 29, stat: "23°", esito: "" },
        { min: 30, max: 30, stat: "27°", esito: "" },
        { min: 31, max: 31, stat: "30°", esito: "" },
        { min: 32, max: 32, stat: "35°", esito: "" },
        { min: 33, max: 33, stat: "40°", esito: "" },
        { min: 34, max: 34, stat: "46°", esito: "" },
        { min: 35, max: 35, stat: "49°", esito: "" },
        { min: 36, max: 36, stat: "54°", esito: "" },
        { min: 37, max: 37, stat: "57°", esito: "" },
        { min: 38, max: 38, stat: "62°", esito: "" },
        { min: 39, max: 39, stat: "65°", esito: "" },
        { min: 40, max: 40, stat: "68°", esito: "" },
        { min: 41, max: 41, stat: "71°", esito: "" },
        { min: 42, max: 42, stat: "74°", esito: "" },
        { min: 43, max: 43, stat: "77°", esito: "" },
        { min: 44, max: 44, stat: "79°", esito: "" },
        { min: 45, max: 45, stat: "82°", esito: "" },
        { min: 46, max: 46, stat: "85°", esito: "" },
        { min: 47, max: 47, stat: "87°", esito: "limite" },
        { min: 48, max: 48, stat: "88°", esito: "limite" },
        { min: 49, max: 49, stat: "89°", esito: "limite" },
        { min: 50, max: 50, stat: "90°", esito: "limite" },
        { min: 51, max: 51, stat: "92°", esito: "limite" },
        { min: 52, max: 52, stat: "93°", esito: "limite" },
        { min: 53, max: 53, stat: "94°", esito: "limite" },
        { min: 54, max: 54, stat: "95°", esito: "sintomatico" },
        { min: 55, max: 55, stat: "96°", esito: "sintomatico" },
        { min: 56, max: 56, stat: "96°", esito: "sintomatico" },
        { min: 57, max: 57, stat: "97°", esito: "sintomatico" },
        { min: 58, max: 58, stat: "97°", esito: "sintomatico" },
        { min: 59, max: 59, stat: "97°", esito: "sintomatico" },
        { min: 60, max: 60, stat: "98°", esito: "sintomatico" },
        { min: 61, max: 61, stat: "98°", esito: "sintomatico" },
        { min: 62, max: 62, stat: "99°", esito: "fortemente sintomatico" },
        { min: 63, max: 63, stat: "99°", esito: "fortemente sintomatico" },
        { min: 64, max: 64, stat: "99°", esito: "fortemente sintomatico" },
        { min: 65, max: 65, stat: "99°", esito: "fortemente sintomatico" },
        { min: 66, max: 66, stat: "99°", esito: "fortemente sintomatico" },
        { min: 67, max: 67, stat: "99°", esito: "fortemente sintomatico" },
        { min: 68, max: 68, stat: "99°", esito: "fortemente sintomatico" },
        { min: 69, max: 69, stat: "99°", esito: "fortemente sintomatico" },
        { min: 70, max: 70, stat: "99°", esito: "fortemente sintomatico" },
        { min: 71, max: 71, stat: "99°", esito: "fortemente sintomatico" },
        { min: 72, max: 72, stat: "99°", esito: "fortemente sintomatico" },
        { min: 73, max: 73, stat: "99°", esito: "fortemente sintomatico" },
        { min: 74, max: 74, stat: "99°", esito: "fortemente sintomatico" },
        { min: 75, max: 75, stat: "99°", esito: "fortemente sintomatico" },
        { min: 76, max: 76, stat: "99°", esito: "fortemente sintomatico" },
        { min: 77, max: 77, stat: "99°", esito: "fortemente sintomatico" },
        { min: 78, max: 78, stat: "99°", esito: "fortemente sintomatico" },
        { min: 79, max: 79, stat: "99°", esito: "fortemente sintomatico" },
        { min: 80, max: 80, stat: "99°", esito: "fortemente sintomatico" },
      ],
    },
    age_40_49: {
      ansia_stato: [
        { min: 20, max: 20, stat: "1°", esito: "" },
        { min: 21, max: 21, stat: "2°", esito: "" },
        { min: 22, max: 22, stat: "3°", esito: "" },
        { min: 23, max: 23, stat: "3°", esito: "" },
        { min: 24, max: 24, stat: "4°", esito: "" },
        { min: 25, max: 25, stat: "6°", esito: "" },
        { min: 26, max: 26, stat: "7°", esito: "" },
        { min: 27, max: 27, stat: "10°", esito: "" },
        { min: 28, max: 28, stat: "12°", esito: "" },
        { min: 29, max: 29, stat: "16°", esito: "" },
        { min: 30, max: 30, stat: "20°", esito: "" },
        { min: 31, max: 31, stat: "26°", esito: "" },
        { min: 32, max: 32, stat: "30°", esito: "" },
        { min: 33, max: 33, stat: "35°", esito: "" },
        { min: 34, max: 34, stat: "38°", esito: "" },
        { min: 35, max: 35, stat: "42°", esito: "" },
        { min: 36, max: 36, stat: "47°", esito: "" },
        { min: 37, max: 37, stat: "51°", esito: "" },
        { min: 38, max: 38, stat: "55°", esito: "" },
        { min: 39, max: 39, stat: "59°", esito: "" },
        { min: 40, max: 40, stat: "62°", esito: "" },
        { min: 41, max: 41, stat: "65°", esito: "" },
        { min: 42, max: 42, stat: "70°", esito: "" },
        { min: 43, max: 43, stat: "73°", esito: "" },
        { min: 44, max: 44, stat: "76°", esito: "" },
        { min: 45, max: 45, stat: "78°", esito: "" },
        { min: 46, max: 46, stat: "79°", esito: "" },
        { min: 47, max: 47, stat: "81°", esito: "" },
        { min: 48, max: 48, stat: "83°", esito: "" },
        { min: 49, max: 49, stat: "84°", esito: "limite" },
        { min: 50, max: 50, stat: "85°", esito: "limite" },
        { min: 51, max: 51, stat: "89°", esito: "limite" },
        { min: 52, max: 52, stat: "90°", esito: "limite" },
        { min: 53, max: 53, stat: "92°", esito: "limite" },
        { min: 54, max: 54, stat: "94°", esito: "limite" },
        { min: 55, max: 55, stat: "94°", esito: "limite" },
        { min: 56, max: 56, stat: "94°", esito: "limite" },
        { min: 57, max: 57, stat: "95°", esito: "sintomatico" },
        { min: 58, max: 58, stat: "96°", esito: "sintomatico" },
        { min: 59, max: 59, stat: "97°", esito: "sintomatico" },
        { min: 60, max: 60, stat: "98°", esito: "sintomatico" },
        { min: 61, max: 61, stat: "98°", esito: "sintomatico" },
        { min: 62, max: 62, stat: "98°", esito: "sintomatico" },
        { min: 63, max: 63, stat: "99°", esito: "fortemente sintomatico" },
        { min: 64, max: 64, stat: "99°", esito: "fortemente sintomatico" },
        { min: 65, max: 65, stat: "99°", esito: "fortemente sintomatico" },
        { min: 66, max: 66, stat: "99°", esito: "fortemente sintomatico" },
        { min: 67, max: 67, stat: "99°", esito: "fortemente sintomatico" },
        { min: 68, max: 68, stat: "99°", esito: "fortemente sintomatico" },
        { min: 69, max: 69, stat: "99°", esito: "fortemente sintomatico" },
        { min: 70, max: 70, stat: "99°", esito: "fortemente sintomatico" },
        { min: 71, max: 71, stat: "99°", esito: "fortemente sintomatico" },
        { min: 72, max: 72, stat: "99°", esito: "fortemente sintomatico" },
        { min: 73, max: 73, stat: "99°", esito: "fortemente sintomatico" },
        { min: 74, max: 74, stat: "99°", esito: "fortemente sintomatico" },
        { min: 75, max: 75, stat: "99°", esito: "fortemente sintomatico" },
        { min: 76, max: 76, stat: "99°", esito: "fortemente sintomatico" },
        { min: 77, max: 77, stat: "99°", esito: "fortemente sintomatico" },
        { min: 78, max: 78, stat: "99°", esito: "fortemente sintomatico" },
        { min: 79, max: 79, stat: "99°", esito: "fortemente sintomatico" },
        { min: 80, max: 80, stat: "99°", esito: "fortemente sintomatico" },
      ],
      ansia_tratto: [
        { min: 20, max: 20, stat: "1°", esito: "" },
        { min: 21, max: 21, stat: "1°", esito: "" },
        { min: 22, max: 22, stat: "2°", esito: "" },
        { min: 23, max: 23, stat: "3°", esito: "" },
        { min: 24, max: 24, stat: "4°", esito: "" },
        { min: 25, max: 25, stat: "6°", esito: "" },
        { min: 26, max: 26, stat: "8°", esito: "" },
        { min: 27, max: 27, stat: "11°", esito: "" },
        { min: 28, max: 28, stat: "13°", esito: "" },
        { min: 29, max: 29, stat: "16°", esito: "" },
        { min: 30, max: 30, stat: "19°", esito: "" },
        { min: 31, max: 31, stat: "23°", esito: "" },
        { min: 32, max: 32, stat: "30°", esito: "" },
        { min: 33, max: 33, stat: "36°", esito: "" },
        { min: 34, max: 34, stat: "39°", esito: "" },
        { min: 35, max: 35, stat: "45°", esito: "" },
        { min: 36, max: 36, stat: "50°", esito: "" },
        { min: 37, max: 37, stat: "55°", esito: "" },
        { min: 38, max: 38, stat: "59°", esito: "" },
        { min: 39, max: 39, stat: "65°", esito: "" },
        { min: 40, max: 40, stat: "67°", esito: "" },
        { min: 41, max: 41, stat: "71°", esito: "" },
        { min: 42, max: 42, stat: "74°", esito: "" },
        { min: 43, max: 43, stat: "79°", esito: "" },
        { min: 44, max: 44, stat: "81°", esito: "" },
        { min: 45, max: 45, stat: "83°", esito: "" },
        { min: 46, max: 46, stat: "85°", esito: "limite" },
        { min: 47, max: 47, stat: "86°", esito: "limite" },
        { min: 48, max: 48, stat: "87°", esito: "limite" },
        { min: 49, max: 49, stat: "89°", esito: "limite" },
        { min: 50, max: 50, stat: "90°", esito: "limite" },
        { min: 51, max: 51, stat: "91°", esito: "limite" },
        { min: 52, max: 52, stat: "92°", esito: "limite" },
        { min: 53, max: 53, stat: "92°", esito: "limite" },
        { min: 54, max: 54, stat: "93°", esito: "limite" },
        { min: 55, max: 55, stat: "93°", esito: "limite" },
        { min: 56, max: 56, stat: "94°", esito: "limite" },
        { min: 57, max: 57, stat: "95°", esito: "sintomatico" },
        { min: 58, max: 58, stat: "98°", esito: "sintomatico" },
        { min: 59, max: 59, stat: "98°", esito: "sintomatico" },
        { min: 60, max: 60, stat: "98°", esito: "sintomatico" },
        { min: 61, max: 61, stat: "98°", esito: "sintomatico" },
        { min: 62, max: 62, stat: "98°", esito: "sintomatico" },
        { min: 63, max: 63, stat: "99°", esito: "fortemente sintomatico" },
        { min: 64, max: 64, stat: "99°", esito: "fortemente sintomatico" },
        { min: 65, max: 65, stat: "99°", esito: "fortemente sintomatico" },
        { min: 66, max: 66, stat: "99°", esito: "fortemente sintomatico" },
        { min: 67, max: 67, stat: "99°", esito: "fortemente sintomatico" },
        { min: 68, max: 68, stat: "99°", esito: "fortemente sintomatico" },
        { min: 69, max: 69, stat: "99°", esito: "fortemente sintomatico" },
        { min: 70, max: 70, stat: "99°", esito: "fortemente sintomatico" },
        { min: 71, max: 71, stat: "99°", esito: "fortemente sintomatico" },
        { min: 72, max: 72, stat: "99°", esito: "fortemente sintomatico" },
        { min: 73, max: 73, stat: "99°", esito: "fortemente sintomatico" },
        { min: 74, max: 74, stat: "99°", esito: "fortemente sintomatico" },
        { min: 75, max: 75, stat: "99°", esito: "fortemente sintomatico" },
        { min: 76, max: 76, stat: "99°", esito: "fortemente sintomatico" },
        { min: 77, max: 77, stat: "99°", esito: "fortemente sintomatico" },
        { min: 78, max: 78, stat: "99°", esito: "fortemente sintomatico" },
        { min: 79, max: 79, stat: "99°", esito: "fortemente sintomatico" },
        { min: 80, max: 80, stat: "99°", esito: "fortemente sintomatico" },
      ],
    },
    age_50_plus: {
      ansia_stato: [
        { min: 20, max: 20, stat: "1°", esito: "" },
        { min: 21, max: 21, stat: "1°", esito: "" },
        { min: 22, max: 22, stat: "2°", esito: "" },
        { min: 23, max: 23, stat: "3°", esito: "" },
        { min: 24, max: 24, stat: "6°", esito: "" },
        { min: 25, max: 25, stat: "6°", esito: "" },
        { min: 26, max: 26, stat: "7°", esito: "" },
        { min: 27, max: 27, stat: "10°", esito: "" },
        { min: 28, max: 28, stat: "12°", esito: "" },
        { min: 29, max: 29, stat: "15°", esito: "" },
        { min: 30, max: 30, stat: "16°", esito: "" },
        { min: 31, max: 31, stat: "20°", esito: "" },
        { min: 32, max: 32, stat: "29°", esito: "" },
        { min: 33, max: 33, stat: "34°", esito: "" },
        { min: 34, max: 34, stat: "39°", esito: "" },
        { min: 35, max: 35, stat: "44°", esito: "" },
        { min: 36, max: 36, stat: "47°", esito: "" },
        { min: 37, max: 37, stat: "50°", esito: "" },
        { min: 38, max: 38, stat: "57°", esito: "" },
        { min: 39, max: 39, stat: "61°", esito: "" },
        { min: 40, max: 40, stat: "63°", esito: "" },
        { min: 41, max: 41, stat: "66°", esito: "" },
        { min: 42, max: 42, stat: "67°", esito: "" },
        { min: 43, max: 43, stat: "68°", esito: "" },
        { min: 44, max: 44, stat: "70°", esito: "" },
        { min: 45, max: 45, stat: "72°", esito: "" },
        { min: 46, max: 46, stat: "74°", esito: "" },
        { min: 47, max: 47, stat: "74°", esito: "" },
        { min: 48, max: 48, stat: "75°", esito: "" },
        { min: 49, max: 49, stat: "80°", esito: "" },
        { min: 50, max: 50, stat: "83°", esito: "" },
        { min: 51, max: 51, stat: "84°", esito: "limite" },
        { min: 52, max: 52, stat: "86°", esito: "limite" },
        { min: 53, max: 53, stat: "89°", esito: "limite" },
        { min: 54, max: 54, stat: "91°", esito: "limite" },
        { min: 55, max: 55, stat: "92°", esito: "limite" },
        { min: 56, max: 56, stat: "92°", esito: "limite" },
        { min: 57, max: 57, stat: "93°", esito: "limite" },
        { min: 58, max: 58, stat: "96°", esito: "sintomatico" },
        { min: 59, max: 59, stat: "96°", esito: "sintomatico" },
        { min: 60, max: 60, stat: "96°", esito: "sintomatico" },
        { min: 61, max: 61, stat: "96°", esito: "sintomatico" },
        { min: 62, max: 62, stat: "97°", esito: "sintomatico" },
        { min: 63, max: 63, stat: "97°", esito: "sintomatico" },
        { min: 64, max: 64, stat: "97°", esito: "sintomatico" },
        { min: 65, max: 65, stat: "98°", esito: "sintomatico" },
        { min: 66, max: 66, stat: "98°", esito: "sintomatico" },
        { min: 67, max: 67, stat: "98°", esito: "sintomatico" },
        { min: 68, max: 68, stat: "98°", esito: "sintomatico" },
        { min: 69, max: 69, stat: "98°", esito: "sintomatico" },
        { min: 70, max: 70, stat: "99°", esito: "fortemente sintomatico" },
        { min: 71, max: 71, stat: "99°", esito: "fortemente sintomatico" },
        { min: 72, max: 72, stat: "99°", esito: "fortemente sintomatico" },
        { min: 73, max: 73, stat: "99°", esito: "fortemente sintomatico" },
        { min: 74, max: 74, stat: "99°", esito: "fortemente sintomatico" },
        { min: 75, max: 75, stat: "99°", esito: "fortemente sintomatico" },
        { min: 76, max: 76, stat: "99°", esito: "fortemente sintomatico" },
        { min: 77, max: 77, stat: "99°", esito: "fortemente sintomatico" },
        { min: 78, max: 78, stat: "99°", esito: "fortemente sintomatico" },
        { min: 79, max: 79, stat: "99°", esito: "fortemente sintomatico" },
        { min: 80, max: 80, stat: "99°", esito: "fortemente sintomatico" },
      ],
      ansia_tratto: [
        { min: 20, max: 20, stat: "1°", esito: "" },
        { min: 21, max: 21, stat: "1°", esito: "" },
        { min: 22, max: 22, stat: "1°", esito: "" },
        { min: 23, max: 23, stat: "1°", esito: "" },
        { min: 24, max: 24, stat: "1°", esito: "" },
        { min: 25, max: 25, stat: "3°", esito: "" },
        { min: 26, max: 26, stat: "6°", esito: "" },
        { min: 27, max: 27, stat: "9°", esito: "" },
        { min: 28, max: 28, stat: "11°", esito: "" },
        { min: 29, max: 29, stat: "16°", esito: "" },
        { min: 30, max: 30, stat: "22°", esito: "" },
        { min: 31, max: 31, stat: "25°", esito: "" },
        { min: 32, max: 32, stat: "28°", esito: "" },
        { min: 33, max: 33, stat: "34°", esito: "" },
        { min: 34, max: 34, stat: "34°", esito: "" },
        { min: 35, max: 35, stat: "38°", esito: "" },
        { min: 36, max: 36, stat: "43°", esito: "" },
        { min: 37, max: 37, stat: "44°", esito: "" },
        { min: 38, max: 38, stat: "49°", esito: "" },
        { min: 39, max: 39, stat: "54°", esito: "" },
        { min: 40, max: 40, stat: "59°", esito: "" },
        { min: 41, max: 41, stat: "64°", esito: "" },
        { min: 42, max: 42, stat: "66°", esito: "" },
        { min: 43, max: 43, stat: "70°", esito: "" },
        { min: 44, max: 44, stat: "72°", esito: "" },
        { min: 45, max: 45, stat: "73°", esito: "" },
        { min: 46, max: 46, stat: "78°", esito: "" },
        { min: 47, max: 47, stat: "79°", esito: "" },
        { min: 48, max: 48, stat: "80°", esito: "" },
        { min: 49, max: 49, stat: "82°", esito: "" },
        { min: 50, max: 50, stat: "84°", esito: "limite" },
        { min: 51, max: 51, stat: "86°", esito: "limite" },
        { min: 52, max: 52, stat: "87°", esito: "limite" },
        { min: 53, max: 53, stat: "87°", esito: "limite" },
        { min: 54, max: 54, stat: "88°", esito: "limite" },
        { min: 55, max: 55, stat: "90°", esito: "limite" },
        { min: 56, max: 56, stat: "92°", esito: "limite" },
        { min: 57, max: 57, stat: "93°", esito: "limite" },
        { min: 58, max: 58, stat: "94°", esito: "limite" },
        { min: 59, max: 59, stat: "96°", esito: "sintomatico" },
        { min: 60, max: 60, stat: "96°", esito: "sintomatico" },
        { min: 61, max: 61, stat: "97°", esito: "sintomatico" },
        { min: 62, max: 62, stat: "97°", esito: "sintomatico" },
        { min: 63, max: 63, stat: "98°", esito: "sintomatico" },
        { min: 64, max: 64, stat: "98°", esito: "sintomatico" },
        { min: 65, max: 65, stat: "98°", esito: "sintomatico" },
        { min: 66, max: 66, stat: "98°", esito: "sintomatico" },
        { min: 67, max: 67, stat: "98°", esito: "sintomatico" },
        { min: 68, max: 68, stat: "98°", esito: "sintomatico" },
        { min: 69, max: 69, stat: "98°", esito: "sintomatico" },
        { min: 70, max: 70, stat: "98°", esito: "sintomatico" },
        { min: 71, max: 71, stat: "99°", esito: "fortemente sintomatico" },
        { min: 72, max: 72, stat: "99°", esito: "fortemente sintomatico" },
        { min: 73, max: 73, stat: "99°", esito: "fortemente sintomatico" },
        { min: 74, max: 74, stat: "99°", esito: "fortemente sintomatico" },
        { min: 75, max: 75, stat: "99°", esito: "fortemente sintomatico" },
        { min: 76, max: 76, stat: "99°", esito: "fortemente sintomatico" },
        { min: 77, max: 77, stat: "99°", esito: "fortemente sintomatico" },
        { min: 78, max: 78, stat: "99°", esito: "fortemente sintomatico" },
        { min: 79, max: 79, stat: "99°", esito: "fortemente sintomatico" },
        { min: 80, max: 80, stat: "99°", esito: "fortemente sintomatico" },
      ],
    },
  },
  FEMALE: {
    under_40: {
      ansia_stato: [
        { min: 20, max: 20, stat: "1°", esito: "" },
        { min: 21, max: 21, stat: "1°", esito: "" },
        { min: 22, max: 22, stat: "1°", esito: "" },
        { min: 23, max: 23, stat: "2°", esito: "" },
        { min: 24, max: 24, stat: "3°", esito: "" },
        { min: 25, max: 25, stat: "4°", esito: "" },
        { min: 26, max: 26, stat: "5°", esito: "" },
        { min: 27, max: 27, stat: "8°", esito: "" },
        { min: 28, max: 28, stat: "10°", esito: "" },
        { min: 29, max: 29, stat: "13°", esito: "" },
        { min: 30, max: 30, stat: "19°", esito: "" },
        { min: 31, max: 31, stat: "24°", esito: "" },
        { min: 32, max: 32, stat: "29°", esito: "" },
        { min: 33, max: 33, stat: "34°", esito: "" },
        { min: 34, max: 34, stat: "38°", esito: "" },
        { min: 35, max: 35, stat: "43°", esito: "" },
        { min: 36, max: 36, stat: "48°", esito: "" },
        { min: 37, max: 37, stat: "53°", esito: "" },
        { min: 38, max: 38, stat: "57°", esito: "" },
        { min: 39, max: 39, stat: "60°", esito: "" },
        { min: 40, max: 40, stat: "62°", esito: "" },
        { min: 41, max: 41, stat: "64°", esito: "" },
        { min: 42, max: 42, stat: "67°", esito: "" },
        { min: 43, max: 43, stat: "69°", esito: "" },
        { min: 44, max: 44, stat: "72°", esito: "" },
        { min: 45, max: 45, stat: "73°", esito: "" },
        { min: 46, max: 46, stat: "76°", esito: "" },
        { min: 47, max: 47, stat: "77°", esito: "" },
        { min: 48, max: 48, stat: "79°", esito: "" },
        { min: 49, max: 49, stat: "81°", esito: "" },
        { min: 50, max: 50, stat: "82°", esito: "" },
        { min: 51, max: 51, stat: "84°", esito: "limite" },
        { min: 52, max: 52, stat: "86°", esito: "limite" },
        { min: 53, max: 53, stat: "88°", esito: "limite" },
        { min: 54, max: 54, stat: "89°", esito: "limite" },
        { min: 55, max: 55, stat: "90°", esito: "limite" },
        { min: 56, max: 56, stat: "91°", esito: "limite" },
        { min: 57, max: 57, stat: "92°", esito: "limite" },
        { min: 58, max: 58, stat: "94°", esito: "limite" },
        { min: 59, max: 59, stat: "95°", esito: "sintomatico" },
        { min: 60, max: 60, stat: "95°", esito: "sintomatico" },
        { min: 61, max: 61, stat: "96°", esito: "sintomatico" },
        { min: 62, max: 62, stat: "96°", esito: "sintomatico" },
        { min: 63, max: 63, stat: "97°", esito: "sintomatico" },
        { min: 64, max: 64, stat: "98°", esito: "sintomatico" },
        { min: 65, max: 65, stat: "98°", esito: "sintomatico" },
        { min: 66, max: 66, stat: "99°", esito: "fortemente sintomatico" },
        { min: 67, max: 67, stat: "99°", esito: "fortemente sintomatico" },
        { min: 68, max: 68, stat: "99°", esito: "fortemente sintomatico" },
        { min: 69, max: 69, stat: "99°", esito: "fortemente sintomatico" },
        { min: 70, max: 70, stat: "99°", esito: "fortemente sintomatico" },
        { min: 71, max: 71, stat: "99°", esito: "fortemente sintomatico" },
        { min: 72, max: 72, stat: "99°", esito: "fortemente sintomatico" },
        { min: 73, max: 73, stat: "99°", esito: "fortemente sintomatico" },
        { min: 74, max: 74, stat: "99°", esito: "fortemente sintomatico" },
        { min: 75, max: 75, stat: "99°", esito: "fortemente sintomatico" },
        { min: 76, max: 76, stat: "99°", esito: "fortemente sintomatico" },
        { min: 77, max: 77, stat: "99°", esito: "fortemente sintomatico" },
        { min: 78, max: 78, stat: "99°", esito: "fortemente sintomatico" },
        { min: 79, max: 79, stat: "99°", esito: "fortemente sintomatico" },
        { min: 80, max: 80, stat: "99°", esito: "fortemente sintomatico" },
      ],
      ansia_tratto: [
        { min: 20, max: 20, stat: "1°", esito: "" },
        { min: 21, max: 21, stat: "1°", esito: "" },
        { min: 22, max: 22, stat: "1°", esito: "" },
        { min: 23, max: 23, stat: "1°", esito: "" },
        { min: 24, max: 24, stat: "1°", esito: "" },
        { min: 25, max: 25, stat: "2°", esito: "" },
        { min: 26, max: 26, stat: "2°", esito: "" },
        { min: 27, max: 27, stat: "4°", esito: "" },
        { min: 28, max: 28, stat: "7°", esito: "" },
        { min: 29, max: 29, stat: "9°", esito: "" },
        { min: 30, max: 30, stat: "12°", esito: "" },
        { min: 31, max: 31, stat: "15°", esito: "" },
        { min: 32, max: 32, stat: "19°", esito: "" },
        { min: 33, max: 33, stat: "20°", esito: "" },
        { min: 34, max: 34, stat: "24°", esito: "" },
        { min: 35, max: 35, stat: "28°", esito: "" },
        { min: 36, max: 36, stat: "32°", esito: "" },
        { min: 37, max: 37, stat: "37°", esito: "" },
        { min: 38, max: 38, stat: "40°", esito: "" },
        { min: 39, max: 39, stat: "54°", esito: "" },
        { min: 40, max: 40, stat: "49°", esito: "" },
        { min: 41, max: 41, stat: "53°", esito: "" },
        { min: 42, max: 42, stat: "56°", esito: "" },
        { min: 43, max: 43, stat: "59°", esito: "" },
        { min: 44, max: 44, stat: "61°", esito: "" },
        { min: 45, max: 45, stat: "64°", esito: "" },
        { min: 46, max: 46, stat: "67°", esito: "" },
        { min: 47, max: 47, stat: "70°", esito: "" },
        { min: 48, max: 48, stat: "73°", esito: "" },
        { min: 49, max: 49, stat: "76°", esito: "" },
        { min: 50, max: 50, stat: "78°", esito: "" },
        { min: 51, max: 51, stat: "82°", esito: "" },
        { min: 52, max: 52, stat: "84°", esito: "limite" },
        { min: 53, max: 53, stat: "87°", esito: "limite" },
        { min: 54, max: 54, stat: "89°", esito: "limite" },
        { min: 55, max: 55, stat: "90°", esito: "limite" },
        { min: 56, max: 56, stat: "92°", esito: "limite" },
        { min: 57, max: 57, stat: "94°", esito: "limite" },
        { min: 58, max: 58, stat: "95°", esito: "sintomatico" },
        { min: 59, max: 59, stat: "96°", esito: "sintomatico" },
        { min: 60, max: 60, stat: "97°", esito: "sintomatico" },
        { min: 61, max: 61, stat: "97°", esito: "sintomatico" },
        { min: 62, max: 62, stat: "97°", esito: "sintomatico" },
        { min: 63, max: 63, stat: "98°", esito: "sintomatico" },
        { min: 64, max: 64, stat: "99°", esito: "fortemente sintomatico" },
        { min: 65, max: 65, stat: "99°", esito: "fortemente sintomatico" },
        { min: 66, max: 66, stat: "99°", esito: "fortemente sintomatico" },
        { min: 67, max: 67, stat: "99°", esito: "fortemente sintomatico" },
        { min: 68, max: 68, stat: "99°", esito: "fortemente sintomatico" },
        { min: 69, max: 69, stat: "99°", esito: "fortemente sintomatico" },
        { min: 70, max: 70, stat: "99°", esito: "fortemente sintomatico" },
        { min: 71, max: 71, stat: "99°", esito: "fortemente sintomatico" },
        { min: 72, max: 72, stat: "99°", esito: "fortemente sintomatico" },
        { min: 73, max: 73, stat: "99°", esito: "fortemente sintomatico" },
        { min: 74, max: 74, stat: "99°", esito: "fortemente sintomatico" },
        { min: 75, max: 75, stat: "99°", esito: "fortemente sintomatico" },
        { min: 76, max: 76, stat: "99°", esito: "fortemente sintomatico" },
        { min: 77, max: 77, stat: "99°", esito: "fortemente sintomatico" },
        { min: 78, max: 78, stat: "99°", esito: "fortemente sintomatico" },
        { min: 79, max: 79, stat: "99°", esito: "fortemente sintomatico" },
        { min: 80, max: 80, stat: "99°", esito: "fortemente sintomatico" },
      ],
    },
    age_40_49: {
      ansia_stato: [
        { min: 20, max: 20, stat: "1°", esito: "" },
        { min: 21, max: 21, stat: "1°", esito: "" },
        { min: 22, max: 22, stat: "1°", esito: "" },
        { min: 23, max: 23, stat: "1°", esito: "" },
        { min: 24, max: 24, stat: "1°", esito: "" },
        { min: 25, max: 25, stat: "2°", esito: "" },
        { min: 26, max: 26, stat: "2°", esito: "" },
        { min: 27, max: 27, stat: "8°", esito: "" },
        { min: 28, max: 28, stat: "10°", esito: "" },
        { min: 29, max: 29, stat: "13°", esito: "" },
        { min: 30, max: 30, stat: "17°", esito: "" },
        { min: 31, max: 31, stat: "22°", esito: "" },
        { min: 32, max: 32, stat: "25°", esito: "" },
        { min: 33, max: 33, stat: "27°", esito: "" },
        { min: 34, max: 34, stat: "32°", esito: "" },
        { min: 35, max: 35, stat: "37°", esito: "" },
        { min: 36, max: 36, stat: "40°", esito: "" },
        { min: 37, max: 37, stat: "44°", esito: "" },
        { min: 38, max: 38, stat: "46°", esito: "" },
        { min: 39, max: 39, stat: "49°", esito: "" },
        { min: 40, max: 40, stat: "51°", esito: "" },
        { min: 41, max: 41, stat: "55°", esito: "" },
        { min: 42, max: 42, stat: "57°", esito: "" },
        { min: 43, max: 43, stat: "61°", esito: "" },
        { min: 44, max: 44, stat: "63°", esito: "" },
        { min: 45, max: 45, stat: "68°", esito: "" },
        { min: 46, max: 46, stat: "71°", esito: "" },
        { min: 47, max: 47, stat: "73°", esito: "" },
        { min: 48, max: 48, stat: "75°", esito: "" },
        { min: 49, max: 49, stat: "78°", esito: "" },
        { min: 50, max: 50, stat: "79°", esito: "" },
        { min: 51, max: 51, stat: "83°", esito: "" },
        { min: 52, max: 52, stat: "85°", esito: "limite" },
        { min: 53, max: 53, stat: "85°", esito: "limite" },
        { min: 54, max: 54, stat: "86°", esito: "limite" },
        { min: 55, max: 55, stat: "87°", esito: "limite" },
        { min: 56, max: 56, stat: "89°", esito: "limite" },
        { min: 57, max: 57, stat: "90°", esito: "limite" },
        { min: 58, max: 58, stat: "91°", esito: "limite" },
        { min: 59, max: 59, stat: "92°", esito: "limite" },
        { min: 60, max: 60, stat: "93°", esito: "limite" },
        { min: 61, max: 61, stat: "94°", esito: "limite" },
        { min: 62, max: 62, stat: "95°", esito: "sintomatico" },
        { min: 63, max: 63, stat: "97°", esito: "sintomatico" },
        { min: 64, max: 64, stat: "98°", esito: "sintomatico" },
        { min: 65, max: 65, stat: "99°", esito: "fortemente sintomatico" },
        { min: 66, max: 66, stat: "99°", esito: "fortemente sintomatico" },
        { min: 67, max: 67, stat: "99°", esito: "fortemente sintomatico" },
        { min: 68, max: 68, stat: "99°", esito: "fortemente sintomatico" },
        { min: 69, max: 69, stat: "99°", esito: "fortemente sintomatico" },
        { min: 70, max: 70, stat: "99°", esito: "fortemente sintomatico" },
        { min: 71, max: 71, stat: "99°", esito: "fortemente sintomatico" },
        { min: 72, max: 72, stat: "99°", esito: "fortemente sintomatico" },
        { min: 73, max: 73, stat: "99°", esito: "fortemente sintomatico" },
        { min: 74, max: 74, stat: "99°", esito: "fortemente sintomatico" },
        { min: 75, max: 75, stat: "99°", esito: "fortemente sintomatico" },
        { min: 76, max: 76, stat: "99°", esito: "fortemente sintomatico" },
        { min: 77, max: 77, stat: "99°", esito: "fortemente sintomatico" },
        { min: 78, max: 78, stat: "99°", esito: "fortemente sintomatico" },
        { min: 79, max: 79, stat: "99°", esito: "fortemente sintomatico" },
        { min: 80, max: 80, stat: "99°", esito: "fortemente sintomatico" },
      ],
      ansia_tratto: [
        { min: 20, max: 20, stat: "1°", esito: "" },
        { min: 21, max: 21, stat: "1°", esito: "" },
        { min: 22, max: 22, stat: "1°", esito: "" },
        { min: 23, max: 23, stat: "2°", esito: "" },
        { min: 24, max: 24, stat: "3°", esito: "" },
        { min: 25, max: 25, stat: "3°", esito: "" },
        { min: 26, max: 26, stat: "4°", esito: "" },
        { min: 27, max: 27, stat: "6°", esito: "" },
        { min: 28, max: 28, stat: "7°", esito: "" },
        { min: 29, max: 29, stat: "9°", esito: "" },
        { min: 30, max: 30, stat: "12°", esito: "" },
        { min: 31, max: 31, stat: "14°", esito: "" },
        { min: 32, max: 32, stat: "18°", esito: "" },
        { min: 33, max: 33, stat: "21°", esito: "" },
        { min: 34, max: 34, stat: "26°", esito: "" },
        { min: 35, max: 35, stat: "31°", esito: "" },
        { min: 36, max: 36, stat: "43°", esito: "" },
        { min: 37, max: 37, stat: "38°", esito: "" },
        { min: 38, max: 38, stat: "39°", esito: "" },
        { min: 39, max: 39, stat: "42°", esito: "" },
        { min: 40, max: 40, stat: "45°", esito: "" },
        { min: 41, max: 41, stat: "51°", esito: "" },
        { min: 42, max: 42, stat: "53°", esito: "" },
        { min: 43, max: 43, stat: "54°", esito: "" },
        { min: 44, max: 44, stat: "59°", esito: "" },
        { min: 45, max: 45, stat: "62°", esito: "" },
        { min: 46, max: 46, stat: "67°", esito: "" },
        { min: 47, max: 47, stat: "67°", esito: "" },
        { min: 48, max: 48, stat: "72°", esito: "" },
        { min: 49, max: 49, stat: "75°", esito: "" },
        { min: 50, max: 50, stat: "78°", esito: "" },
        { min: 51, max: 51, stat: "81°", esito: "" },
        { min: 52, max: 52, stat: "84°", esito: "limite" },
        { min: 53, max: 53, stat: "86°", esito: "limite" },
        { min: 54, max: 54, stat: "88°", esito: "limite" },
        { min: 55, max: 55, stat: "90°", esito: "limite" },
        { min: 56, max: 56, stat: "91°", esito: "limite" },
        { min: 57, max: 57, stat: "92°", esito: "limite" },
        { min: 58, max: 58, stat: "92°", esito: "limite" },
        { min: 59, max: 59, stat: "95°", esito: "sintomatico" },
        { min: 60, max: 60, stat: "97°", esito: "sintomatico" },
        { min: 61, max: 61, stat: "98°", esito: "sintomatico" },
        { min: 62, max: 62, stat: "98°", esito: "sintomatico" },
        { min: 63, max: 63, stat: "99°", esito: "fortemente sintomatico" },
        { min: 64, max: 64, stat: "99°", esito: "fortemente sintomatico" },
        { min: 65, max: 65, stat: "99°", esito: "fortemente sintomatico" },
        { min: 66, max: 66, stat: "99°", esito: "fortemente sintomatico" },
        { min: 67, max: 67, stat: "99°", esito: "fortemente sintomatico" },
        { min: 68, max: 68, stat: "99°", esito: "fortemente sintomatico" },
        { min: 69, max: 69, stat: "99°", esito: "fortemente sintomatico" },
        { min: 70, max: 70, stat: "99°", esito: "fortemente sintomatico" },
        { min: 71, max: 71, stat: "99°", esito: "fortemente sintomatico" },
        { min: 72, max: 72, stat: "99°", esito: "fortemente sintomatico" },
        { min: 73, max: 73, stat: "99°", esito: "fortemente sintomatico" },
        { min: 74, max: 74, stat: "99°", esito: "fortemente sintomatico" },
        { min: 75, max: 75, stat: "99°", esito: "fortemente sintomatico" },
        { min: 76, max: 76, stat: "99°", esito: "fortemente sintomatico" },
        { min: 77, max: 77, stat: "99°", esito: "fortemente sintomatico" },
        { min: 78, max: 78, stat: "99°", esito: "fortemente sintomatico" },
        { min: 79, max: 79, stat: "99°", esito: "fortemente sintomatico" },
        { min: 80, max: 80, stat: "99°", esito: "fortemente sintomatico" },
      ],
    },
    age_50_plus: {
      ansia_stato: [
        { min: 20, max: 20, stat: "1°", esito: "" },
        { min: 21, max: 21, stat: "1°", esito: "" },
        { min: 22, max: 22, stat: "3°", esito: "" },
        { min: 23, max: 23, stat: "4°", esito: "" },
        { min: 24, max: 24, stat: "5°", esito: "" },
        { min: 25, max: 25, stat: "5°", esito: "" },
        { min: 26, max: 26, stat: "5°", esito: "" },
        { min: 27, max: 27, stat: "8°", esito: "" },
        { min: 28, max: 28, stat: "9°", esito: "" },
        { min: 29, max: 29, stat: "10°", esito: "" },
        { min: 30, max: 30, stat: "13°", esito: "" },
        { min: 31, max: 31, stat: "18°", esito: "" },
        { min: 32, max: 32, stat: "18°", esito: "" },
        { min: 33, max: 33, stat: "22°", esito: "" },
        { min: 34, max: 34, stat: "24°", esito: "" },
        { min: 35, max: 35, stat: "27°", esito: "" },
        { min: 36, max: 36, stat: "32°", esito: "" },
        { min: 37, max: 37, stat: "36°", esito: "" },
        { min: 38, max: 38, stat: "40°", esito: "" },
        { min: 39, max: 39, stat: "41°", esito: "" },
        { min: 40, max: 40, stat: "44°", esito: "" },
        { min: 41, max: 41, stat: "47°", esito: "" },
        { min: 42, max: 42, stat: "50°", esito: "" },
        { min: 43, max: 43, stat: "53°", esito: "" },
        { min: 44, max: 44, stat: "53°", esito: "" },
        { min: 45, max: 45, stat: "56°", esito: "" },
        { min: 46, max: 46, stat: "56°", esito: "" },
        { min: 47, max: 47, stat: "59°", esito: "" },
        { min: 48, max: 48, stat: "59°", esito: "" },
        { min: 49, max: 49, stat: "63°", esito: "" },
        { min: 50, max: 50, stat: "64°", esito: "" },
        { min: 51, max: 51, stat: "69°", esito: "" },
        { min: 52, max: 52, stat: "71°", esito: "" },
        { min: 53, max: 53, stat: "73°", esito: "" },
        { min: 54, max: 54, stat: "77°", esito: "" },
        { min: 55, max: 55, stat: "81°", esito: "" },
        { min: 56, max: 56, stat: "83°", esito: "" },
        { min: 57, max: 57, stat: "84°", esito: "limite" },
        { min: 58, max: 58, stat: "86°", esito: "limite" },
        { min: 59, max: 59, stat: "87°", esito: "limite" },
        { min: 60, max: 60, stat: "94°", esito: "limite" },
        { min: 61, max: 61, stat: "95°", esito: "sintomatico" },
        { min: 62, max: 62, stat: "96°", esito: "sintomatico" },
        { min: 63, max: 63, stat: "97°", esito: "sintomatico" },
        { min: 64, max: 64, stat: "98°", esito: "sintomatico" },
        { min: 65, max: 65, stat: "98°", esito: "sintomatico" },
        { min: 66, max: 66, stat: "98°", esito: "sintomatico" },
        { min: 67, max: 67, stat: "98°", esito: "sintomatico" },
        { min: 68, max: 68, stat: "98°", esito: "sintomatico" },
        { min: 69, max: 69, stat: "98°", esito: "sintomatico" },
        { min: 70, max: 70, stat: "99°", esito: "fortemente sintomatico" },
        { min: 71, max: 71, stat: "99°", esito: "fortemente sintomatico" },
        { min: 72, max: 72, stat: "99°", esito: "fortemente sintomatico" },
        { min: 73, max: 73, stat: "99°", esito: "fortemente sintomatico" },
        { min: 74, max: 74, stat: "99°", esito: "fortemente sintomatico" },
        { min: 75, max: 75, stat: "99°", esito: "fortemente sintomatico" },
        { min: 76, max: 76, stat: "99°", esito: "fortemente sintomatico" },
        { min: 77, max: 77, stat: "99°", esito: "fortemente sintomatico" },
        { min: 78, max: 78, stat: "99°", esito: "fortemente sintomatico" },
        { min: 79, max: 79, stat: "99°", esito: "fortemente sintomatico" },
        { min: 80, max: 80, stat: "99°", esito: "fortemente sintomatico" },
      ],
      ansia_tratto: [
        { min: 20, max: 20, stat: "1°", esito: "" },
        { min: 21, max: 21, stat: "1°", esito: "" },
        { min: 22, max: 22, stat: "1°", esito: "" },
        { min: 23, max: 23, stat: "1°", esito: "" },
        { min: 24, max: 24, stat: "1°", esito: "" },
        { min: 25, max: 25, stat: "3°", esito: "" },
        { min: 26, max: 26, stat: "5°", esito: "" },
        { min: 27, max: 27, stat: "5°", esito: "" },
        { min: 28, max: 28, stat: "5°", esito: "" },
        { min: 29, max: 29, stat: "5°", esito: "" },
        { min: 30, max: 30, stat: "6°", esito: "" },
        { min: 31, max: 31, stat: "9°", esito: "" },
        { min: 32, max: 32, stat: "15°", esito: "" },
        { min: 33, max: 33, stat: "19°", esito: "" },
        { min: 34, max: 34, stat: "22°", esito: "" },
        { min: 35, max: 35, stat: "27°", esito: "" },
        { min: 36, max: 36, stat: "27°", esito: "" },
        { min: 37, max: 37, stat: "30°", esito: "" },
        { min: 38, max: 38, stat: "33°", esito: "" },
        { min: 39, max: 39, stat: "36°", esito: "" },
        { min: 40, max: 40, stat: "42°", esito: "" },
        { min: 41, max: 41, stat: "44°", esito: "" },
        { min: 42, max: 42, stat: "49°", esito: "" },
        { min: 43, max: 43, stat: "50°", esito: "" },
        { min: 44, max: 44, stat: "50°", esito: "" },
        { min: 45, max: 45, stat: "51°", esito: "" },
        { min: 46, max: 46, stat: "55°", esito: "" },
        { min: 47, max: 47, stat: "59°", esito: "" },
        { min: 48, max: 48, stat: "65°", esito: "" },
        { min: 49, max: 49, stat: "71°", esito: "" },
        { min: 50, max: 50, stat: "76°", esito: "" },
        { min: 51, max: 51, stat: "78°", esito: "" },
        { min: 52, max: 52, stat: "82°", esito: "" },
        { min: 53, max: 53, stat: "86°", esito: "limite" },
        { min: 54, max: 54, stat: "89°", esito: "limite" },
        { min: 55, max: 55, stat: "89°", esito: "limite" },
        { min: 56, max: 56, stat: "92°", esito: "limite" },
        { min: 57, max: 57, stat: "95°", esito: "sintomatico" },
        { min: 58, max: 58, stat: "95°", esito: "sintomatico" },
        { min: 59, max: 59, stat: "96°", esito: "sintomatico" },
        { min: 60, max: 60, stat: "96°", esito: "sintomatico" },
        { min: 61, max: 61, stat: "96°", esito: "sintomatico" },
        { min: 62, max: 62, stat: "96°", esito: "sintomatico" },
        { min: 63, max: 63, stat: "96°", esito: "sintomatico" },
        { min: 64, max: 64, stat: "97°", esito: "sintomatico" },
        { min: 65, max: 65, stat: "97°", esito: "sintomatico" },
        { min: 66, max: 66, stat: "97°", esito: "sintomatico" },
        { min: 67, max: 67, stat: "99°", esito: "fortemente sintomatico" },
        { min: 68, max: 68, stat: "99°", esito: "fortemente sintomatico" },
        { min: 69, max: 69, stat: "99°", esito: "fortemente sintomatico" },
        { min: 70, max: 70, stat: "99°", esito: "fortemente sintomatico" },
        { min: 71, max: 71, stat: "99°", esito: "fortemente sintomatico" },
        { min: 72, max: 72, stat: "99°", esito: "fortemente sintomatico" },
        { min: 73, max: 73, stat: "99°", esito: "fortemente sintomatico" },
        { min: 74, max: 74, stat: "99°", esito: "fortemente sintomatico" },
        { min: 75, max: 75, stat: "99°", esito: "fortemente sintomatico" },
        { min: 76, max: 76, stat: "99°", esito: "fortemente sintomatico" },
        { min: 77, max: 77, stat: "99°", esito: "fortemente sintomatico" },
        { min: 78, max: 78, stat: "99°", esito: "fortemente sintomatico" },
        { min: 79, max: 79, stat: "99°", esito: "fortemente sintomatico" },
        { min: 80, max: 80, stat: "99°", esito: "fortemente sintomatico" },
      ],
    },
  },
};

// ===============================
// ✅ HELPERS
// ===============================

function classify(
  score: number,
  rows: RangeRow[],
): { stat: Stat; esito: Esito } {
  const matches: { stat: Stat; esito: Esito }[] = [];

  for (const r of rows) {
    if (score >= r.min && score <= r.max) {
      matches.push({ stat: r.stat, esito: r.esito });
    }
  }

  // If multiple matches, take the first one (most specific usually comes first)
  if (matches.length > 0) {
    return matches[0];
  }

  return { stat: "", esito: "" };
}

/**
 * UI sometimes sends:
 * - "Per nulla__0"
 * - "0__0"
 * - { label: "Per nulla" }
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
  const needsReverse =
    PART1_REVERSE.includes(questionNumber) ||
    PART2_REVERSE.includes(questionNumber);

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
    // Reverse: 1→4, 2→3, 3→2, 4→1
    return 5 - rawScore;
  }

  return rawScore;
}

function getAgeGroup(age: number | null | undefined): AgeGroup {
  if (age == null || age < 40) return "under_40";
  if (age >= 40 && age < 50) return "age_40_49";
  return "age_50_plus";
}

// ===============================
// COMPUTE (with gender & age-based norms)
// ===============================

export type ComputeCtx = {
  patientSex?: string | null; // "female" | "male"
  patientAge?: number | null;
};

export function computeStaiOther(
  answers: Record<string, any>,
  ctx?: ComputeCtx,
) {
  // Part 1: State Anxiety (questions 1-20)
  const scores_part1: number[] = [];
  for (let i = 1; i <= 20; i++) {
    scores_part1.push(toScore(answers[qKey(i)], i));
  }
  const ansia_stato_punteggio = scores_part1.reduce((a, b) => a + b, 0);

  // Part 2: Trait Anxiety (questions 21-40)
  const scores_part2: number[] = [];
  for (let i = 21; i <= 40; i++) {
    scores_part2.push(toScore(answers[qKey(i)], i));
  }
  const ansia_tratto_punteggio = scores_part2.reduce((a, b) => a + b, 0);

  // Determine gender and age group
  const gender: GenderKey =
    String(ctx?.patientSex || "").toLowerCase() === "female"
      ? "FEMALE"
      : "MALE";

  const ageGroup = getAgeGroup(ctx?.patientAge);

  // Select appropriate norms
  const norms = NORMS[gender][ageGroup];

  // Classify scores
  const ansia_stato = classify(ansia_stato_punteggio, norms.ansia_stato);
  const ansia_tratto = classify(ansia_tratto_punteggio, norms.ansia_tratto);

  return {
    // State Anxiety
    "Ansia di stato PG": String(ansia_stato_punteggio),
    "Ansia di stato STAT": ansia_stato.stat,
    "Ansia di stato ESITO": ansia_stato.esito,

    // Trait Anxiety
    "Ansia di tratto PG": String(ansia_tratto_punteggio),
    "Ansia di tratto STAT": ansia_tratto.stat,
    "Ansia di tratto ESITO": ansia_tratto.esito,

    // Metadata
    "Gender used": gender,
    "Age group used": ageGroup,
  };
}
