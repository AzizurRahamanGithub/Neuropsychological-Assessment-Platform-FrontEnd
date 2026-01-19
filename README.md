# NeuroPsych Platform

A comprehensive neuropsychological diagnostic questionnaire platform for clinicians and patients. This production-ready application enables clinicians to manage patient assessments, assign questionnaires, and analyze results with automatic metric calculation.

## Features

### Core Features

- **Patient Management System**
  - Create and manage patient profiles with comprehensive demographic data
  - Searchable/filterable patient table with quick actions
  - Patient detail view showing all assignments and completion status

- **Questionnaire Management**
  - 30+ pre-configured questionnaires including ADHD diagnostic scales
  - Support for self-report (SELF) and informant (OTHER) questionnaire types
  - Multi-select interface for batch questionnaire assignment

- **Secure Link Generation**
  - One aggregated link for all self-report questionnaires
  - Individual links for each informant questionnaire
  - 30-day expiration with UUID-based security
  - Email distribution integration

- **Patient Interface**
  - Fully responsive design (desktop, tablet, mobile)
  - Multi-language support (Italian, English, German, French)
  - Real-time auto-save every 5 seconds with progress tracking
  - Session persistence - resume from exact stopping point
  - Validation with highlighted unanswered questions
  - Progress indicator showing current questionnaire number and total

- **Calculation Engine**
  - Automatic ADHD metric calculation (13 distinct metrics)
  - Percentile and T-score generation
  - Cut-off status determination
  - Statistical significance testing
  - Diagnostic classification (ADHD, Borderline, Non-ADHD)

- **Results & Export**
  - Comprehensive results dashboard with filtering
  - Export to Word (.docx) in exact template format
  - Export to CSV for data analysis
  - Professional formatted reports

- **Security**
  - JWT token-based authentication
  - Secure link tokens impossible to guess
  - HTTPS enforcement
  - CSRF protection
  - Rate limiting ready
  - GDPR compliance features
