# NeuroPsych Platform - Developer Guide

## Getting Started as a Developer

This guide will help you set up the development environment and understand the codebase.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL 13+
- Python 3.9+ (for backend)
- Git

## Frontend Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

### 4. Available Scripts
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run linter
npm test          # Run tests
```

## Backend Development Setup

### 1. Create Python Virtual Environment
```bash
cd backend
python -m venv venv

# Activate venv
# macOS/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate
```

### 2. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 3. Create Database
```bash
createdb neuropsych_db
```

### 4. Configure Environment
Create `backend/.env`:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://neuropsych_user:password@localhost:5432/neuropsych_db
CORS_ALLOWED_ORIGINS=http://localhost:3000
JWT_SECRET_KEY=your-jwt-secret
```

### 5. Run Migrations
```bash
python manage.py migrate
```

### 6. Create Superuser
```bash
python manage.py createsuperuser
```

### 7. Start Backend Server
```bash
python manage.py runserver
```

Backend API will be at `http://localhost:8000`

## Code Organization

### Frontend Structure

```
/app
├── /admin/login              # Clinician login
├── /admin/dashboard          # Main admin interface
│   ├── /patients             # Patient management
│   ├── /questionnaires       # Assignment interface
│   └── /results              # Results dashboard
├── /questionnaire/[token]    # Patient questionnaire
└── page.tsx                  # Landing page

/src
├── /config
│   └── app.ts               # App configuration
├── /lib
│   ├── api-client.ts        # API wrapper
│   ├── calculation-engine.ts # ADHD metrics
│   └── document-export.ts   # Export functionality
├── /types
│   └── index.ts             # TypeScript types
└── /hooks
    ├── useApi.ts            # API hooks
    ├── useAutoSave.ts       # Auto-save hook
    └── useTranslation.ts    # i18n hook
```

### Key Files

**Configuration**:
- `/src/config/app.ts` - App-wide settings
- `/app/layout.tsx` - Root layout
- `/app/globals.css` - Global styles

**Types**:
- `/src/types/index.ts` - All TypeScript interfaces

**Utilities**:
- `/src/lib/api-client.ts` - API requests
- `/src/lib/calculation-engine.ts` - ADHD calculations
- `/src/lib/document-export.ts` - Word/CSV export

**Hooks**:
- `/src/hooks/useApi.ts` - Data fetching
- `/src/hooks/useAutoSave.ts` - Auto-save with debounce
- `/src/hooks/useTranslation.ts` - Multi-language

## Common Development Tasks

### Adding a New Page

1. Create file in `/app/[route]/page.tsx`
2. Use the dashboard layout for admin pages
3. Import needed components from shadcn/ui
4. Use hooks for data fetching

Example:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MyPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Fetch data
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Page</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content here */}
      </CardContent>
    </Card>
  );
}
```

### Adding a New API Call

1. Use the `apiClient` or custom hooks from `/src/hooks/useApi.ts`
2. Handle errors appropriately
3. Set loading states

Example:
```typescript
import { useApi } from '@/hooks/useApi';

function MyComponent() {
  const { data, isLoading, error, refetch } = useApi('/api/patients/');

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <p>Data: {JSON.stringify(data)}</p>}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Adding a New Translation

1. Add key to `/public/locales/it.json`
2. Add corresponding key to `/public/locales/en.json`
3. Use in component:

```typescript
const { t } = useTranslation();
<h1>{t('myKey.subKey')}</h1>
```

### Working with Auto-Save

```typescript
import { useAutoSave } from '@/hooks/useAutoSave';

const { isSaving, lastSavedAt, saveError } = useAutoSave(data, {
  onSave: async (currentData) => {
    await apiClient.patch('/api/responses/', currentData);
  },
  interval: 5000,  // 5 seconds
  debounce: 1000,  // 1 second debounce
});
```

## Database Schema

Key tables:

- `users` - User accounts (clinicians, patients)
- `patients` - Patient profiles
- `questionnaires` - Questionnaire definitions
- `questions` - Individual questions
- `questionnaire_assignments` - Patient-Questionnaire assignments
- `questionnaire_links` - Secure access links
- `responses` - Patient responses
- `questionnaire_results` - Calculated results
- `adhd_metrics` - ADHD-specific metrics

See `/scripts/init-database.sql` for full schema.

## ADHD Calculation Reference

The calculation engine in `/src/lib/calculation-engine.ts` implements:

1. **Symptom Counting**: Responses ≥ 2 count as present symptoms
2. **Score Calculation**: Sum of all responses for each dimension
3. **Percentile**: Calculated from T-scores using normal distribution
4. **T-Score**: (rawScore - mean) / SD * 10 + 50
5. **Diagnosis**: Based on DSM-5 criteria

Example usage:
```typescript
import { calculateADHDMetrics, determineCutOffStatus } from '@/lib/calculation-engine';

const metrics = calculateADHDMetrics(responses, questionMapping);
const cutoff = determineCutOffStatus(metrics.disattenzioniPunteggio, 'disattenzione');
```

## API Client Usage

### Basic GET Request
```typescript
const data = await apiClient.get('/api/patients/');
```

### POST Request
```typescript
const result = await apiClient.post('/api/patients/', {
  name: 'Giovanni',
  surname: 'Rossi',
});
```

### With Authentication
```typescript
const token = localStorage.getItem('accessToken');
apiClient.setAuthToken(token);
const data = await apiClient.get('/api/patients/');
```

## Component Pattern

Standard component pattern for pages:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function MyComponent() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Load data
    } catch (err: any) {
      setError(err?.message || 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            // Content here
            null
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

## Testing

### Frontend Tests
```bash
npm test
```

### Backend Tests
```bash
python manage.py test
```

### API Testing
Use Postman or curl:
```bash
curl -X GET http://localhost:8000/api/patients/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Debugging

### Frontend
- Use React DevTools browser extension
- Check browser console for errors
- Use `console.log('[v0]', ...)` for debug output

### Backend
- Django debug mode: `DEBUG=True` in settings
- Check logs: `tail -f logs/debug.log`
- Use Django shell: `python manage.py shell`

## Performance Tips

1. **Use React.memo** for expensive components
2. **Lazy load** images and heavy components
3. **Debounce** API calls (auto-save already does this)
4. **Index database** queries (already done in schema)
5. **Use** CSS classes instead of inline styles

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "feat: add my feature"

# Push to origin
git push origin feature/my-feature

# Create pull request on GitHub
```

## Deployment Checklist

### Frontend
- [ ] Run `npm run build`
- [ ] Check for build errors
- [ ] Test production build locally: `npm run start`
- [ ] Deploy to Vercel

### Backend
- [ ] Set DEBUG=False
- [ ] Configure production database
- [ ] Run migrations: `python manage.py migrate`
- [ ] Collect statics: `python manage.py collectstatic`
- [ ] Deploy with Gunicorn

## Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Database Connection Error
```bash
# Check PostgreSQL is running
brew services list

# Check database exists
psql -l

# Verify connection string in .env
```

### API 401 Unauthorized
- Check token exists in localStorage
- Verify token hasn't expired
- Make sure token is being sent in headers

### Build Errors
```bash
# Clear cache
rm -rf .next
npm cache clean --force

# Reinstall
npm install

# Rebuild
npm run build
```

## Resources

- [Next.js Documentation](https://nextjs.org)
- [React Documentation](https://react.dev)
- [TailwindCSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Django REST Framework](https://www.django-rest-framework.org)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

## Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Format with Prettier
- Write meaningful commit messages
- Document complex logic

## Getting Help

1. Check the README.md
2. Review IMPLEMENTATION_SUMMARY.md
3. Check type definitions in `/src/types/index.ts`
4. Review similar existing code
5. Ask in team discussions

---

Happy coding! 🚀
