# Questionnaire Creation - Visual Guide

## Page Layout

### Add Questionnaire Page (`/admin/dashboard/questionnaires/add`)

```
┌─────────────────────────────────────────────────────────────┐
│  ← [Back Button]  Create New Questionnaire                  │
│                   Define questions, options, and scoring    │
└─────────────────────────────────────────────────────────────┘

┌─ BASIC INFORMATION ────────────────────────────────────────┐
│                                                             │
│  Code *              │  Version *                          │
│  [BAARS_IV________]  │  [1.0_____]                         │
│  Unique ID, uppercase                                      │
│                                                             │
│  Questionnaire Name *                                      │
│  [Barkley Adult ADHD Rating Scale-IV___________________]   │
│                                                             │
│  Description                                               │
│  [Comprehensive ADHD assessment for adults               │
│   ________________________________________________________] │
│                                                             │
│  Type *              │  Category                           │
│  [SELF ▼]            │  [ADHD Assessment_____________]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ QUESTIONS (3) ────────────────────────────────────────────┐
│                                  [+ Add Question]           │
│                                                             │
│  Q1: Difficoltà a concentrarsi su compiti o attività      │
│      [single_choice] [disattenzione] [Mandatory]   [🗑]   │
│      • Mai (0)                                              │
│      • Raramente (1)                                        │
│      • A volte (2)                                          │
│      • Spesso (3)                                           │
│      • Molto spesso (4)                                     │
│                                                             │
│  Q2: Procrastinazione o difficoltà ad iniziare attività   │
│      [single_choice] [disattenzione] [Mandatory]   [🗑]   │
│      • Mai (0)                                              │
│      • Raramente (1)                                        │
│      • A volte (2)                                          │
│      • Spesso (3)                                           │
│      • Molto spesso (4)                                     │
│                                                             │
│  Q3: A che età hai notato questi sintomi?                  │
│      [text]          [eta_inizio]    [Optional]   [🗑]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  [Cancel]  [✓ Create Questionnaire]                          │
└──────────────────────────────────────────────────────────────┘
```

## Add Question Dialog

```
┌─────────────────────────────────────────────────────────────┐
│  Add Question #1                                            │
│  Configure the question text, type, and answer options     │
└─────────────────────────────────────────────────────────────┘

  Question Text *
  [Difficoltà a concentrarsi su compiti o attività_______
  __________________________________________________________]

  Question Type *              Scoring Field
  [single_choice ▼]            [disattenzione ▼]

  ☑ This is a mandatory question

┌─ Answer Options * ─────────────────────────────────────────┐
│                                    [+ Add Option]          │
│                                                             │
│  Option 1          Value    [🗑]                           │
│  [Mai________]     [0]                                      │
│                                                             │
│  Option 2          Value    [🗑]                           │
│  [Raramente___]    [1]                                      │
│                                                             │
│  Option 3          Value    [🗑]                           │
│  [A volte____]     [2]                                      │
│                                                             │
│  Option 4          Value    [🗑]                           │
│  [Spesso_____]     [3]                                      │
│                                                             │
│  Option 5          Value    [🗑]                           │
│  [Molto spesso_]   [4]                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

  [Cancel]  [+ Add Question]
```

## Form State Examples

### Example 1: Starting Fresh

```
CODE: [empty]
NAME: [empty]
TYPE: [SELF]
VERSION: [1.0]
QUESTIONS: 0

Status: Cannot submit (missing required fields)
```

### Example 2: After Basic Info

```
CODE: BAARS_IV
NAME: Barkley Adult ADHD Rating Scale-IV
TYPE: SELF
VERSION: IV
CATEGORY: ADHD Assessment
DESCRIPTION: Comprehensive ADHD assessment for adults

QUESTIONS: 0

Status: Can click "Add Question" but cannot submit without questions
```

### Example 3: With Questions (Ready to Submit)

```
CODE: BAARS_IV
NAME: Barkley Adult ADHD Rating Scale-IV
TYPE: SELF
VERSION: IV
CATEGORY: ADHD Assessment
QUESTIONS: 27

Q1: Difficoltà a concentrarsi su compiti
    Type: single_choice
    Scoring: disattenzione
    Options: 5 (0-4 Likert scale)

Q2: Procrastinazione o difficoltà ad iniziare
    Type: single_choice
    Scoring: disattenzione
    Options: 5 (0-4 Likert scale)

... (25 more questions)

Status: ✅ Ready to submit
```

## Question Type Variations

### Text Input

```
┌─ Question Dialog ──────────────────────────────────────────┐
│  Question Text *                                           │
│  [A che età hai notato questi sintomi?________________]   │
│                                                             │
│  Question Type *              Scoring Field                │
│  [text ▼]                     [eta_inizio ▼]              │
│                                                             │
│  ☑ This is a mandatory question                            │
│                                                             │
│  (No "Answer Options" section shown for text input)        │
│                                                             │
│  [Cancel]  [+ Add Question]                                │
└─────────────────────────────────────────────────────────────┘
```

### Single Choice (Radio)

```
┌─ Question Dialog ──────────────────────────────────────────┐
│  Question Text *                                           │
│  [Hai ricevuto precedentemente una diagnosi di ADHD?____]  │
│                                                             │
│  Question Type *              Scoring Field                │
│  [single_choice ▼]            [diagnosi_precedente ▼]     │
│                                                             │
│  ☑ This is a mandatory question                            │
│                                                             │
│  Answer Options *                    [+ Add Option]        │
│                                                             │
│  Option 1          Value    [🗑]                           │
│  [Sì_______]       [1]                                      │
│                                                             │
│  Option 2          Value    [🗑]                           │
│  [No_______]       [0]                                      │
│                                                             │
│  [Cancel]  [+ Add Question]                                │
└─────────────────────────────────────────────────────────────┘
```

### Multiple Choice (Checkboxes)

```
┌─ Question Dialog ──────────────────────────────────────────┐
│  Question Text *                                           │
│  [Aree di vita compromesse (seleziona tutte)______________]│
│                                                             │
│  Question Type *              Scoring Field                │
│  [multiple_choice ▼]          [ambiti_compromissione ▼]   │
│                                                             │
│  ☑ This is a mandatory question                            │
│                                                             │
│  Answer Options *                    [+ Add Option]        │
│                                                             │
│  Option 1          Value    [🗑]                           │
│  [Lavoro/Scuola]   [1]                                      │
│                                                             │
│  Option 2          Value    [🗑]                           │
│  [Relazioni____]   [1]                                      │
│                                                             │
│  Option 3          Value    [🗑]                           │
│  [Attività ricr.]  [1]                                      │
│                                                             │
│  Option 4          Value    [🗑]                           │
│  [Autostima____]   [1]                                      │
│                                                             │
│  Option 5          Value    [🗑]                           │
│  [Guida/Trasport]  [1]                                      │
│                                                             │
│  [Cancel]  [+ Add Question]                                │
└─────────────────────────────────────────────────────────────┘
```

## Validation Error States

### Missing Required Field

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠ Questionnaire code is required                           │
└─────────────────────────────────────────────────────────────┘

CODE: [EMPTY - highlighted in red]
(Cannot submit)
```

### Missing Question Options

```
Dialog State:
┌─────────────────────────────────────────────────────────────┐
│  ⚠ Please add at least one option for this question         │
│                                                             │
│  Question Type: [single_choice ▼]                          │
│  Answer Options: [0 options added]                         │
│                                                             │
│  [+ Add Option] button is visible                          │
│  [+ Add Question] button is DISABLED                       │
└─────────────────────────────────────────────────────────────┘
```

### No Questions Added

```
Form Level:
┌─────────────────────────────────────────────────────────────┐
│  ⚠ Please add at least one question                         │
│                                                             │
│  QUESTIONS (0)
│  ┌─────────────────────────────────────────────────────────┐
│  │ No questions added yet. Click "Add Question" to start. │
│  └─────────────────────────────────────────────────────────┘
│                                                             │
│  [Cancel]  [Create Questionnaire] (DISABLED - greyed out)  │
└─────────────────────────────────────────────────────────────┘
```

## Success State

```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Questionnaire created successfully! Redirecting...       │
└─────────────────────────────────────────────────────────────┘

(Auto-redirects to /admin/dashboard/questionnaires after 2 sec)
```

## Questionnaires Page Integration

### Before Adding

```
┌─ AVAILABLE QUESTIONNAIRES ────────────────────────────────┐
│                                                             │
│  Name                               │ Type  │ Questions   │
│  ────────────────────────────────────┼───────┼─────────── │
│  Barkley Adult ADHD Rating Scale-IV │ SELF  │ 27      │
│  Conners ADHD Rating Scale          │ SELF  │ 30      │
│  Swanson, Nolan, Pelham Scale       │ OTHER │ 26      │
│  Cambridge Neuropsych Battery       │ SELF  │ 45      │
│  MOXO Test                          │ SELF  │ 15      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### After Creating New

```
┌─ AVAILABLE QUESTIONNAIRES ────────────────────────────────┐
│                                                             │
│  Name                               │ Type  │ Questions   │
│  ────────────────────────────────────┼───────┼─────────── │
│  Barkley Adult ADHD Rating Scale-IV │ SELF  │ 27      │
│  NEW: My Custom Assessment          │ SELF  │ 5       │ ← NEW
│  Conners ADHD Rating Scale          │ SELF  │ 30      │
│  Swanson, Nolan, Pelham Scale       │ OTHER │ 26      │
│  Cambridge Neuropsych Battery       │ SELF  │ 45      │
│  MOXO Test                          │ SELF  │ 15      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Color & State Indicators

### Badge Colors

| Badge | Color | Meaning |
|-------|-------|---------|
| `SELF` | Blue (bg-blue-100) | Self-reported questionnaire |
| `OTHER` | Green (bg-green-100) | Informant-based questionnaire |
| Question type | Blue | Type of question (text, single_choice, etc) |
| Scoring field | Purple | Associated scoring category |
| Optional | Yellow | Optional question |

### Button States

| State | Appearance | Interaction |
|-------|-----------|-------------|
| Normal | Full color, cursor pointer | Clickable |
| Disabled | Greyed out, cursor not-allowed | Not clickable |
| Hover | Slightly darker | Responds to hover |
| Active | Blue highlight | Currently focused |

---

## Mobile Responsive Layout

### Tablet (768px)
```
Grid changes from 1 column to 2 columns for:
- Code and Version fields (side-by-side)
- Type and Category fields (side-by-side)
- Question details (condensed view)
```

### Mobile (320px)
```
All fields stack vertically:
- Code and Version (stacked)
- Type and Category (stacked)
- Question details (card layout)
- Dialog scrollable for question editing
```

---

**Note**: All colors follow the Tailwind CSS theme. See `/app/globals.css` for custom theme tokens.
