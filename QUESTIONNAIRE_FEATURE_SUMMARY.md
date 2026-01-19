# Questionnaire Feature - Complete Summary

## Feature Overview

The NeuroPsych Platform now includes a **complete questionnaire management system** with three main interfaces:

1. **Questionnaire Creation** - Create custom assessments
2. **Questionnaire Assignment** - Assign to patients and generate links
3. **Results Management** - View and export assessment results

## Pages & Routes

### 1. Questionnaire Management Hub
**Route**: `/admin/dashboard/questionnaires`  
**Type**: Main page  
**Features**:
- View all available questionnaires in a table
- See questionnaire details (name, type, category, questions, version)
- Quick access to detailed view
- **NEW**: "New Questionnaire" button leads to creation form

**Components**:
- Questionnaires list table
- Assignment interface (select patient + questionnaires)
- Generated link management
- Copy to clipboard functionality
- Email sending capability

---

### 2. Create Questionnaire (NEW)
**Route**: `/admin/dashboard/questionnaires/add`  
**Type**: Form page  
**Features**:
- Complete questionnaire builder
- Real-time question management
- Answer option configuration
- Scoring field assignment
- Form validation
- Mock API submission

**Form Sections**:
1. **Basic Information**
   - Unique code (BAARS_IV format)
   - Full name
   - Questionnaire type (SELF/OTHER)
   - Version number
   - Optional description and category

2. **Questions Management**
   - Add/remove questions dynamically
   - Configure per question:
     - Question text
     - Question type (text, single_choice, multiple_choice)
     - Scoring field assignment
     - Mandatory flag
     - Answer options (for choice questions)

3. **Answer Options**
   - Text and numeric value
   - Display order (auto-managed)
   - Add/remove options dynamically

4. **Submit & Validation**
   - Required field checking
   - Minimum question requirement
   - Success feedback with redirect

---

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                   QUESTIONNAIRE LIFECYCLE              │
└─────────────────────────────────────────────────────────┘

1. CREATE QUESTIONNAIRE
   ↓
   [/questionnaires/add] → Form submission → Database storage
   
2. QUESTIONNAIRE STORED
   ↓
   Code: BAARS_IV
   Name: Barkley Adult ADHD Rating Scale-IV
   Type: SELF
   Questions: 27
   Status: AVAILABLE
   
3. ASSIGN TO PATIENT
   ↓
   [/questionnaires] → Select patient + questionnaire(s) → Generate links
   
4. GENERATE SECURE LINK
   ↓
   Token: [UUID]
   Type: all_self or single_other
   Expires: 30 days
   Status: ACTIVE
   
5. PATIENT COMPLETES
   ↓
   [/questionnaire/[token]] → Form responses → Auto-save
   
6. RESPONSES STORED
   ↓
   Link ID → Question IDs → Response values
   Status: COMPLETED
   
7. CALCULATE METRICS
   ↓
   Raw scores → Percentile → T-scores → Diagnostic classification
   
8. VIEW & EXPORT RESULTS
   ↓
   [/dashboard/results] → Word/CSV export → Clinical reports
```

## Field Specifications

### Questionnaire Fields

| Field | Type | Required | Max Length | Format |
|-------|------|----------|-----------|--------|
| code | String | Yes | 100 | UPPERCASE_UNDERSCORE |
| name | String | Yes | 255 | Any |
| description | Text | No | 1000 | Any |
| type | Enum | Yes | - | SELF \| OTHER |
| category | String | No | 100 | Any |
| version | String | No | 50 | e.g., 1.0, IV, v3 |
| questionCount | Integer | Yes | - | Auto-calculated |
| createdAt | DateTime | Auto | - | ISO 8601 |

### Question Fields

| Field | Type | Required | Format |
|-------|------|----------|--------|
| questionnaireId | Foreign Key | Yes | Link to questionnaire |
| questionText | Text | Yes | Any |
| questionType | Enum | Yes | text \| single_choice \| multiple_choice |
| questionNumber | Integer | Yes | Sequential (1, 2, 3...) |
| isMandatory | Boolean | Yes | true/false |
| scoringField | String | No | See scoring fields list |

### Question Option Fields

| Field | Type | Required | Format |
|-------|------|----------|--------|
| questionId | Foreign Key | Yes | Link to question |
| optionText | String | Yes | e.g., "Mai", "Sì" |
| optionValue | Integer | No | 0-4 for Likert, 0-1 for yes/no |
| optionOrder | Integer | Yes | Sequential per question |

---

## Scoring Fields Reference

### ADHD-Specific Categories

```
INATTENTION SYMPTOMS (Disattention)
├─ Questions 1-8
├─ Scoring: 0-4 per question
├─ Max Score: 32 points
└─ Clinical threshold: ≥6 symptoms

HYPERACTIVITY SYMPTOMS
├─ Questions 9-12
├─ Scoring: 0-4 per question
├─ Max Score: 16 points
└─ Clinical threshold: ≥6 symptoms

IMPULSIVITY SYMPTOMS
├─ Questions 13-15
├─ Scoring: 0-4 per question
├─ Max Score: 12 points
└─ Clinical threshold: ≥6 symptoms

LIFE DOMAIN IMPAIRMENT
├─ Work/School
├─ Relationships
├─ Recreational activities
├─ Self-esteem
└─ Driving/Transportation

CLINICAL HISTORY
├─ Age of symptom onset
├─ Previous diagnosis
├─ Stress/Trauma history
└─ Current impairment status
```

---

## Integration with Other Features

### Connected to:
- **Patient Management** - Assign questionnaires to specific patients
- **Link Generation** - Create secure access tokens
- **Response Collection** - Store patient answers
- **Results Calculation** - Auto-compute ADHD metrics
- **Export System** - Generate Word/CSV reports
- **Multi-language Support** - Questions translated to Italian/English

### Data Dependencies:
1. Questionnaire must exist before assignment
2. Assignment requires valid patient + questionnaire
3. Link generation requires active assignment
4. Results require completed responses
5. Export requires calculated results

---

## UI Components Used

### Form Components
- `Input` - Text fields (code, name, version)
- `Textarea` - Longer text (description, question text)
- `Select` - Dropdowns (type, question type, scoring field)
- `Checkbox` - Boolean fields (mandatory, options)
- `Button` - Actions (add question, add option, submit)

### Dialog Components
- `Dialog` - Modal for adding questions
- `DialogContent` - Question configuration form
- `DialogTrigger` - "Add Question" button

### Alert Components
- `Alert` - Validation errors and success messages
- `AlertDescription` - Error/success text

### Layout Components
- `Card` - Grouped form sections
- `CardHeader` - Section titles
- `CardContent` - Form fields

---

## Validation Rules

### Questionnaire Level
```
✅ VALID:
- Code: "BAARS_IV" (unique, uppercase, underscore-separated)
- Name: Non-empty string
- Type: Either "SELF" or "OTHER"
- Questions: At least 1

❌ INVALID:
- Code: Empty, duplicate, lowercase, special characters
- Name: Empty
- Type: Invalid value
- Questions: Zero questions
```

### Question Level
```
✅ VALID:
- Text: Non-empty, can be any length
- Type: Valid QuestionType
- Mandatory: Boolean (auto true)

❌ INVALID:
- Text: Empty
- Type: Invalid
- Choice Q without options: Missing answer options
```

### Option Level
```
✅ VALID:
- Text: Non-empty
- Value: Numeric (typically 0-4 for Likert)
- Order: Auto-assigned

❌ INVALID:
- Text: Empty
- Value: Non-numeric
```

---

## Navigation Map

```
ADMIN DASHBOARD
└── Questionnaires
    ├── [MAIN] Manage Questionnaires
    │   ├── Button: "New Questionnaire" → [ADD]
    │   ├── Section: Assignment Interface
    │   │   ├── Select Patient
    │   │   ├── Select Questionnaires (checkboxes)
    │   │   └── Generate Links → [RESULTS]
    │   └── Section: Available Questionnaires (table)
    │       ├── View button per questionnaire
    │       └── Details: name, type, category, questions
    │
    └── [ADD] Create New Questionnaire
        ├── Basic Information
        │   ├── Code input
        │   ├── Name input
        │   ├── Type select
        │   ├── Version input
        │   ├── Description textarea
        │   └── Category input
        ├── Questions Management
        │   ├── Add Question (dialog trigger)
        │   │   ├── Question text textarea
        │   │   ├── Question type select
        │   │   ├── Scoring field select
        │   │   ├── Mandatory checkbox
        │   │   └── Add Options (for choice Q)
        │   │       ├── Option text input
        │   │       ├── Option value input
        │   │       └── Add/Remove option buttons
        │   └── Questions list
        │       ├── Display each question
        │       └── Remove button per question
        └── Submit
            ├── Cancel button
            └── Create Questionnaire button
```

---

## File Structure

```
/app/admin/dashboard/questionnaires/
├── page.tsx (Main questionnaires management)
├── add/ (New feature)
│   └── page.tsx (Create questionnaire form)
└── [id]/ (Future: edit/view detail)
    └── page.tsx (Coming soon)

/src/types/
└── index.ts (Questionnaire type definitions)

/src/lib/
├── calculation-engine.ts (Scoring calculations)
└── document-export.ts (Word/CSV export)

/scripts/
├── init-database.sql (Schema with questionnaire tables)
└── seed-questionnaires.sql (Sample data)

/public/locales/
├── it.json (Italian translations)
└── en.json (English translations)
```

---

## Testing Checklist

### Form Validation
- [ ] Empty code field shows error
- [ ] Duplicate code rejected (on backend)
- [ ] Empty name field shows error
- [ ] Type field required
- [ ] Empty question added shows error
- [ ] Choice question without options shows error
- [ ] Submit with no questions shows error

### Add Question Dialog
- [ ] Dialog opens on "Add Question" click
- [ ] Question text field active
- [ ] Type dropdown changes available options
- [ ] Mandatory checkbox toggles
- [ ] Scoring field optional
- [ ] "Add Option" button visible for choice questions
- [ ] Option fields allow text and value input
- [ ] Remove option works correctly

### Form Submission
- [ ] Valid form can be submitted
- [ ] Success message appears
- [ ] Redirects to questionnaires page
- [ ] New questionnaire visible in list

---

## Future Enhancements

1. **Edit Questionnaire** - Modify existing questionnaires
2. **Duplicate Questionnaire** - Copy existing as template
3. **Question Bank** - Reusable question library
4. **Validation Rules** - Custom validation per question
5. **Conditional Logic** - Show/hide questions based on answers
6. **Branching** - Different paths based on responses
7. **Scoring Templates** - Pre-built scoring algorithms
8. **Multi-language** - Create questions in multiple languages
9. **Version Control** - Track questionnaire changes
10. **Import/Export** - Load from external formats (PDF, Excel)

---

## Support & Documentation

- **Quick Reference**: See `QUESTIONNAIRE_QUICK_REFERENCE.md`
- **Detailed Guide**: See `QUESTIONNAIRE_CREATION_GUIDE.md`
- **Full API Docs**: See `BACKEND_SETUP.md`
- **Type Definitions**: See `/src/types/index.ts`

---

**Status**: ✅ COMPLETE - All questionnaire creation functionality implemented  
**Last Updated**: January 2024  
**Version**: 1.0
