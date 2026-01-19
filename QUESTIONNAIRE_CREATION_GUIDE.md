# Questionnaire Creation Guide

## Overview

The NeuroPsych Platform includes a comprehensive questionnaire creation interface that allows clinicians to build custom diagnostic assessments. This guide explains all features and requirements.

## Accessing the Create Questionnaire Page

1. Navigate to **Admin Dashboard** → **Questionnaires**
2. Click the **"New Questionnaire"** button in the top-right
3. You'll be directed to `/admin/dashboard/questionnaires/add`

## Questionnaire Creation Workflow

### Step 1: Basic Information

Fill in the core questionnaire details:

#### Required Fields:
- **Questionnaire Code** (Unique ID)
  - Format: UPPERCASE_UNDERSCORE (e.g., `BAARS_IV`, `SNAP_IV`)
  - Must be unique in the system
  - Used for database references and API calls

- **Questionnaire Name**
  - Full, descriptive name of the assessment
  - Example: "Barkley Adult ADHD Rating Scale-IV"

- **Type**
  - **SELF**: Self-report (patient completes about themselves)
  - **OTHER**: Informant-based (parent, teacher, spouse completes about patient)

- **Version**
  - Version number of the questionnaire
  - Format: e.g., "1.0", "2.1", "IV", "v3"

#### Optional Fields:
- **Description**: Brief explanation of what the questionnaire measures
- **Category**: Classification (e.g., "ADHD Assessment", "Neuropsychological", "Attention")

### Step 2: Add Questions

Questions are the core components of your questionnaire. Each question includes:

#### Question Details:

1. **Question Text** (Required)
   - The actual question/statement presented to respondents
   - Example: "Difficoltà a concentrarsi su compiti o attività"

2. **Question Type** (Required)
   - **Text Input**: Open-ended responses (e.g., age, free text)
   - **Single Choice**: Radio buttons (only one answer)
   - **Multiple Choice**: Checkboxes (multiple answers allowed)

3. **Scoring Field** (Optional)
   - Links the question to a specific scoring category
   - Available fields:
     - `disattenzione` - Inattention/Disattention
     - `iperattivita` - Hyperactivity
     - `impulsivita` - Impulsivity
     - `sct` - Stress/Trauma history
     - `eta_inizio` - Age of symptom onset
     - `ambiti_compromissione` - Life domains impairment
     - `diagnosi_precedente` - Previous diagnosis

4. **Mandatory Flag**
   - Check to require answer
   - Uncheck to make optional

5. **Answer Options** (For single/multiple choice questions)
   - **Option Text**: The answer choice text
   - **Option Value**: Numeric value for scoring (e.g., 0-4 for Likert scale)
   - **Order**: Display order (auto-managed)

### Step 3: Configure Answer Options

For choice-based questions, define all possible answers:

#### Example: Likert Scale (Common in ADHD assessments)
```
Option 1: "Mai (0)" → Value: 0
Option 2: "Raramente (1)" → Value: 1
Option 3: "A volte (2)" → Value: 2
Option 4: "Spesso (3)" → Value: 3
Option 5: "Molto spesso (4)" → Value: 4
```

#### Example: Yes/No Questions
```
Option 1: "Sì" → Value: 1
Option 2: "No" → Value: 0
```

#### Example: Multiple Domain Selection
```
Option 1: "Lavoro/Scuola" → Value: 1
Option 2: "Relazioni" → Value: 1
Option 3: "Attività ricreative" → Value: 1
Option 4: "Autostima" → Value: 1
Option 5: "Guida/Trasporto" → Value: 1
```

### Step 4: Review and Submit

Before clicking "Create Questionnaire":

1. **Verify all required fields are completed**
   - Code and Name are mandatory
   - At least one question is added
   - All questions have valid configuration

2. **Check question numbering** - Auto-numbered sequentially (Q1, Q2, etc.)

3. **Validate scoring fields** - Ensure consistency across similar questions

4. **Review question flow** - Ensure logical progression

## Best Practices

### Question Design

✅ **DO:**
- Keep questions concise and clear
- Use consistent language throughout
- Group related questions together
- Follow clinical best practices for assessment design
- Ensure scoring fields match question content

❌ **DON'T:**
- Use ambiguous wording
- Mix question types unnecessarily
- Create redundant questions
- Assign conflicting scoring fields

### Scoring Configuration

1. **Consistency**: Use same scoring system for similar questions
   - Likert scales should have same point values
   - Optional questions clearly marked

2. **ADHD-Specific Scoring**:
   - Disattention: Questions 1-8 (typically scored 0-4)
   - Hyperactivity: Questions 9-12 (typically scored 0-4)
   - Impulsivity: Questions 13-15 (typically scored 0-4)

3. **Impairment Domains**:
   - Each domain (work, relationships, etc.) marked separately
   - Scored as presence/absence (0 or 1)

## Pre-configured Questionnaire Examples

The system includes 5 sample questionnaires:

### 1. Barkley Adult ADHD Rating Scale-IV (BAARS_IV)
- **Questions**: 27
- **Type**: SELF
- **Scoring**: Disattention, Hyperactivity, Impulsivity, Symptom Onset, Impairment Domains

### 2. Conners ADHD Rating Scale (CONNERS_ADHD)
- **Questions**: 30
- **Type**: SELF
- **Focus**: ADHD symptoms across multiple domains

### 3. SNAP-IV Rating Scale (SNAP_IV)
- **Questions**: 26
- **Type**: OTHER
- **Focus**: Parent/Teacher ratings of ADHD and ODD

### 4. Cambridge Neuropsych Battery (CANTAB)
- **Questions**: 45
- **Type**: SELF
- **Focus**: Cognitive assessment

### 5. MOXO Test (MOXO)
- **Questions**: 15
- **Type**: SELF
- **Focus**: Attention and impulsivity

## Data Storage and Retrieval

### Database Structure

When you create a questionnaire, the system stores:

1. **Questionnaire Record**
   - Basic info (code, name, description, type, category, version)
   - Auto-generated question count

2. **Questions**
   - Each question with text, type, and number
   - Mandatory flag
   - Scoring field reference

3. **Question Options**
   - All answer choices with text and numeric values
   - Display order

4. **Relationships**
   - Links between questions and options
   - Assignment tracking when questionnaire is used

### API Integration

Once created, the questionnaire becomes available for:
- **Assignment to Patients**: Via the Assignment interface
- **Link Generation**: Creating secure access tokens
- **Response Collection**: Collecting patient answers
- **Scoring Calculations**: Automatic metric calculations
- **Result Export**: Word and CSV exports

## Editing Questionnaires

Currently, the system supports creating new questionnaires. To modify:

1. **View existing questionnaires**: Check the "Available Questionnaires" table
2. **Access via API**: Coming in backend implementation
3. **Future feature**: Direct edit interface

## Troubleshooting

### Issue: Cannot add question without options

**Solution**: For choice-based questions (Single/Multiple Choice), you must add at least one option. Use the "Add Option" button within the question dialog.

### Issue: Scoring field not appearing

**Solution**: Scoring fields are optional. Only assign them for questions that contribute to calculated metrics.

### Issue: Question order changes

**Solution**: Questions are auto-numbered based on addition order. Remove and re-add if you need to reorder.

## Next Steps

1. **Create your questionnaire** using the form
2. **Assign to patients** via the Assignment interface
3. **Generate access links** for patients to complete
4. **View results** in the Results Dashboard
5. **Export reports** in Word or CSV format

## Support

For questions about questionnaire design:
- Refer to original assessment guidelines
- Consult clinical literature
- Review scoring manuals
- Contact your assessment coordinator

---

**Last Updated**: 2024
**Version**: 1.0
