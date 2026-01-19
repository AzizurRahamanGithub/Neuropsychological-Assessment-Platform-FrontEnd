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

## Project Structure

```
neuropsych-platform/
├── /app                          # Next.js app router
│   ├── /admin/dashboard          # Clinician admin interface
│   │   ├── /patients             # Patient management
│   │   ├── /questionnaires       # Questionnaire assignment
│   │   └── /results              # Results dashboard
│   ├── /questionnaire            # Patient questionnaire interface
│   └── page.tsx                  # Home page
├── /src
│   ├── /config                   # Application configuration
│   ├── /lib                      # Utility functions
│   │   ├── api-client.ts         # API client wrapper
│   │   ├── calculation-engine.ts # ADHD calculation logic
│   │   └── document-export.ts    # Word/CSV export
│   ├── /types                    # TypeScript type definitions
│   └── /hooks                    # Custom React hooks
│       ├── useApi.ts             # API request hooks
│       ├── useAutoSave.ts        # Auto-save functionality
│       └── useTranslation.ts     # Multi-language support
├── /public/locales               # Translation files (JSON)
├── /scripts                      # Database setup scripts
│   ├── init-database.sql         # Schema creation
│   └── seed-questionnaires.sql   # Sample data
└── BACKEND_SETUP.md              # Django backend documentation
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 + shadcn/ui
- **State Management**: Zustand + React Query
- **Form Management**: React Hook Form
- **i18n**: Next-intl / Custom i18n hook
- **Document Export**: docx library

### Backend
- **Framework**: Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT
- **CORS**: django-cors-headers

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL 13+

### Frontend Setup

1. **Clone and install dependencies**
```bash
npm install
```

2. **Create environment variables** (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

3. **Run development server**
```bash
npm run dev
```

Access the app at `http://localhost:3000`

### Backend Setup

See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for comprehensive backend configuration instructions.

Quick start:
```bash
# Setup Python environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create database
createdb neuropsych_db

# Run migrations
python manage.py migrate

# Load seed data
python manage.py shell < scripts/seed-data.py

# Start server
python manage.py runserver
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register/` - Register new clinician
- `POST /api/auth/login/` - Get JWT tokens
- `POST /api/auth/refresh/` - Refresh token
- `POST /api/auth/logout/` - Logout

### Patient Management
- `GET /api/patients/` - List patients
- `POST /api/patients/` - Create patient
- `GET /api/patients/{id}/` - Get patient details
- `PUT /api/patients/{id}/` - Update patient
- `DELETE /api/patients/{id}/` - Delete patient

### Questionnaires
- `GET /api/questionnaires/` - List questionnaires
- `GET /api/questionnaires/{id}/` - Get questionnaire with questions
- `POST /api/assignments/` - Assign questionnaires

### Links & Responses
- `POST /api/links/` - Generate secure links
- `GET /api/links/{token}/` - Access questionnaire (public)
- `POST /api/responses/` - Save response
- `POST /api/responses/batch/` - Batch save responses

### Results
- `POST /api/results/calculate/` - Calculate metrics
- `GET /api/results/?patient_id={id}` - Get results
- `GET /api/results/{id}/export/` - Export as Word

## Usage

### For Clinicians

1. **Login** to the admin dashboard
2. **Add Patients** - Create new patient profiles with demographic data
3. **Assign Questionnaires** - Select questionnaires and generate secure links
4. **Send to Patients** - Email links or share manually
5. **Review Results** - Monitor completion and view calculated metrics
6. **Export Reports** - Generate Word documents or CSV exports

### For Patients

1. **Access Link** - Click the secure link received from clinician
2. **Complete Questionnaire** - Answer all questions using radio buttons/checkboxes/text
3. **Auto-Save** - Responses save automatically every 5 seconds
4. **Resume Later** - Close and reopen the link to continue from same point
5. **Submit** - Submit all responses when complete

## Multi-Language Support

The platform supports 4 languages by default:
- **Italian** (it) - Default
- **English** (en)
- **German** (de)
- **French** (fr)

Translation files are in `/public/locales/` as JSON files.

To use translations in components:

```typescript
import { useTranslation } from '@/hooks/useTranslation';

export function MyComponent() {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <p>{t('admin.dashboard.welcome')}</p>
      <select onChange={(e) => changeLanguage(e.target.value as Language)}>
        <option value="it">Italiano</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
```

## ADHD Calculation Engine

### 13 ADHD Metrics Calculated

1. **Disattenzione (Inattention)**
   - N° sintomi (Symptom count)
   - Punteggio (Raw score)

2. **Iperattività (Hyperactivity)**
   - N° sintomi (Symptom count)
   - Punteggio (Raw score)

3. **Impulsività (Impulsivity)**
   - N° sintomi (Symptom count)
   - Punteggio (Raw score)

4. **SCT (Sluggish Cognitive Tempo)**
   - N° sintomi (Symptom count)
   - Punteggio (Raw score)

5. **Totals**
   - Totale ADHD punteggio (Total ADHD score)
   - Totale ADHD n° sintomi (Total ADHD symptoms)
   - Iperattività/Impulsività combined scores

### Results Format

Results are exported in the exact template format specified:

```
TEST | PG | PC | CUT-OFF | STAT | ESITO
-----|----|----|---------|------|------
[Test Name] | [Raw Score] | [Percentile] | [≥93°] | [*] | [Outcome]
```

## Database Schema

The application uses the following main tables:

- `users` - Clinician and patient accounts
- `patients` - Patient demographic data
- `questionnaires` - Questionnaire definitions
- `questions` - Individual questions
- `question_options` - Response options
- `questionnaire_assignments` - Patient-Questionnaire links
- `questionnaire_links` - Secure access tokens
- `responses` - Patient responses
- `questionnaire_results` - Calculated results
- `adhd_metrics` - ADHD-specific metrics
- `audit_logs` - Activity tracking

## Security Features

- ✅ JWT token authentication
- ✅ Secure random link tokens (UUID + random string)
- ✅ 30-day link expiration
- ✅ HTTPS ready
- ✅ CORS protection
- ✅ CSRF protection
- ✅ SQL injection prevention (parameterized queries)
- ✅ Rate limiting ready
- ✅ Password hashing (bcrypt)
- ✅ Session management
- ✅ Data encryption at rest ready
- ✅ GDPR compliance (data export/deletion)

## Testing

### Frontend Testing
```bash
npm test
```

### Backend Testing
```bash
python manage.py test
```

## Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Production)
1. Use production PostgreSQL instance
2. Configure environment variables
3. Use Gunicorn or uWSGI
4. Enable HTTPS
5. Set up logging and monitoring
6. Configure automated backups

## API Response Examples

### Calculate Results
```bash
POST /api/results/calculate/
{
  "link_id": 1,
  "responses": {
    "1": 4,
    "2": 3,
    ...
  }
}

Response:
{
  "id": 1,
  "questionnaire_id": 1,
  "calculated_metrics": {
    "disattenzione_sintomi": 7,
    "disattenzione_punteggio": 24,
    ...
  },
  "percentile_rank": 95,
  "cut_off_status": "Clinical"
}
```

## Performance Considerations

- Auto-save debounced to 1 second minimum
- Auto-save interval set to 5 seconds
- Responses saved immediately server-side
- Lazy loading of questionnaires
- Indexed database queries for fast filtering
- Caching of calculated metrics

## Known Limitations

- PDF export requires additional configuration
- Real-time sync between clinicians viewing same patient requires WebSocket
- Offline support requires additional service worker setup

## Future Enhancements

- [ ] Real-time collaboration features
- [ ] Advanced analytics and trending
- [ ] Video assessment integration
- [ ] Mobile app (React Native)
- [ ] Additional questionnaires (40+)
- [ ] AI-assisted interpretation
- [ ] Automated report generation
- [ ] Patient portal (view own results)

## Support

For technical support, please contact the development team or file an issue on the project repository.

## License

This project is proprietary and confidential. All rights reserved.

## Contributors

Developed by v0 AI Assistant

---

**Last Updated**: January 2026
**Version**: 1.0.0
