# Questionnaire Creation - Quick Reference

## 30-Second Overview

1. Go to **Admin Dashboard** → **Questionnaires** → **New Questionnaire**
2. Fill in basic info (Code, Name, Type, Version)
3. Click **Add Question** and configure each question
4. Define answer options for choice-based questions
5. Click **Create Questionnaire**

## Form Fields Cheat Sheet

### Basic Information Tab

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| Code | ✅ | UPPERCASE_UNDERSCORE | BAARS_IV |
| Name | ✅ | Full title | Barkley Adult ADHD Rating Scale-IV |
| Type | ✅ | SELF or OTHER | SELF |
| Version | ✅ | Number format | 1.0, IV, v3 |
| Description | ❌ | Free text | Comprehensive ADHD assessment |
| Category | ❌ | Classification | ADHD Assessment |

### Question Configuration

| Field | Required | Type | Example |
|-------|----------|------|---------|
| Question Text | ✅ | Text | Difficoltà a concentrarsi |
| Question Type | ✅ | Dropdown | single_choice, multiple_choice, text |
| Scoring Field | ❌ | Dropdown | disattenzione, iperattivita, impulsivita |
| Mandatory | ❌ | Checkbox | Checked/Unchecked |
| Options (for choice Q) | ✅ | Text + Value | "Mai (0)" → 0, "Spesso (3)" → 3 |

## Available Scoring Fields

```
disattenzione          → Inattention symptoms
iperattivita           → Hyperactivity symptoms
impulsivita            → Impulsivity symptoms
sct                    → Stress/trauma history
eta_inizio             → Age of symptom onset
ambiti_compromissione  → Life domain impairment
diagnosi_precedente    → Previous ADHD diagnosis
```

## Question Type Reference

### Text Input
- **Use for**: Age, name, open-ended responses
- **Options**: Not needed
- **Example**: "A che età hai notato questi sintomi?"

### Single Choice (Radio)
- **Use for**: One answer only (Likert scales, yes/no)
- **Options**: Required (minimum 2)
- **Example**: 
  - Mai (0)
  - Raramente (1)
  - A volte (2)
  - Spesso (3)
  - Molto spesso (4)

### Multiple Choice (Checkboxes)
- **Use for**: Multiple answers allowed
- **Options**: Required (minimum 2)
- **Example**:
  - Lavoro/Scuola
  - Relazioni
  - Attività ricreative
  - Autostima

## Standard Scoring Scales

### 5-Point Likert (Most Common for ADHD)
```
Mai (0)           = 0 points
Raramente (1)     = 1 point
A volte (2)       = 2 points
Spesso (3)        = 3 points
Molto spesso (4)  = 4 points
```

### Yes/No Scale
```
Sì (Yes)    = 1 point
No (No)     = 0 points
```

### Presence/Absence
```
Sì (Present)     = 1
No (Absent)      = 0
```

## Common Questionnaire Structures

### ADHD Rating Scales
- **BAARS_IV**: 27 questions, 3 scoring categories, 5 impairment domains
- **CONNERS_ADHD**: 30 questions, multiple subscales
- **SNAP_IV**: 26 questions, OTHER type (informant-based)

### Assessment Pattern
```
Questions 1-8:   Disattention symptoms (Likert 0-4)
Questions 9-12:  Hyperactivity symptoms (Likert 0-4)
Questions 13-15: Impulsivity symptoms (Likert 0-4)
Questions 16-19: Additional symptoms (Likert 0-4)
Question 20:     Age of onset (Single choice: <12, 12-17, 18+)
Questions 21-25: Impairment domains (Yes/No for each domain)
Questions 26-27: Clinical history (Yes/No questions)
```

## Validation Rules

✅ **Must Have**:
- Questionnaire Code (unique)
- Questionnaire Name
- Type (SELF or OTHER)
- At least 1 question
- At least 1 option (for choice questions)

❌ **Cannot Have**:
- Duplicate codes
- Empty question text
- Choice questions without options
- Invalid scoring field references

## Tips & Tricks

### Before Creating:
1. Define all questions in advance
2. Check scoring field consistency
3. Ensure logical question order
4. Validate against original assessment

### During Creation:
1. Add similar question types together
2. Assign scoring fields as you go
3. Remove and re-add if order changes
4. Leave optional fields blank if not needed

### After Creation:
1. It becomes immediately available for assignment
2. Cannot be edited directly (use backend/API)
3. Can be viewed in the Available Questionnaires table
4. Can be assigned to patients

## Common Scoring Patterns

### DSM-5 ADHD Criteria (Simplified)
- **Inattention**: 6+ symptoms from 9 items
- **Hyperactivity-Impulsivity**: 6+ symptoms from 9 items
- **Combined Type**: Both criteria met
- **Predominantly Inattentive**: Inattention criteria only
- **Predominantly Hyperactive**: H-I criteria only

### Percentile Conversion
- Raw score → Percentile rank (compare to norms)
- T-scores → Standardized across populations
- Cut-off status → Clinical significance

## Access the Form

**URL**: `/admin/dashboard/questionnaires/add`

**Button Path**: 
Dashboard → Questionnaires → New Questionnaire

---

**Pro Tip**: Always review your questions one final time before submitting. The form validates all required fields automatically.
