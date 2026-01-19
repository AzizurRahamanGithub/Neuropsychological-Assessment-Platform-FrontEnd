// Application configuration
export const APP_CONFIG = {
  name: 'NeuroPsych Platform',
  description: 'Neuropsychological Diagnostic Questionnaire Platform',
  defaultLanguage: 'it',
  supportedLanguages: ['it', 'en', 'de', 'fr'],
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
  // Link expiration in days
  linkExpirationDays: 30,
  
  // Auto-save interval in milliseconds
  autoSaveIntervalMs: 5000,
  
  // ADHD calculation thresholds
  adhd: {
    disattenzioneThreshold: 6,
    iperattivitaThreshold: 5,
    impulsivitaThreshold: 3,
    totalSymptoms: 18,
  },
};

export const QUESTIONNAIRE_TYPES = {
  SELF: 'SELF',
  OTHER: 'OTHER',
};

export const QUESTION_TYPES = {
  TEXT: 'text',
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
};

export const RESPONSE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SUBMITTED: 'submitted',
};
