// User types
export type UserType = 'clinician' | 'patient';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  createdAt: string;
  updatedAt: string;
}

export interface AuthToken {
  access: string;
  refresh: string;
}

// Patient types
export interface Patient {
  id: number;
  userId: number;
  name: string;
  surname: string;
  sex?: string;
  dateOfBirth?: string;
  yearsOfEducation?: number;
  clinicianId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PatientDetail extends Patient {
  assignments: QuestionnaireAssignment[];
  completionSummary: {
    totalAssigned: number;
    completed: number;
    inProgress: number;
    pending: number;
  };
}

// Questionnaire types
export type QuestionnaireType = 'SELF' | 'OTHER';
export type QuestionType = 'text' | 'single_choice' | 'multiple_choice';

export interface Questionnaire {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: QuestionnaireType;
  category: string;
  questionCount: number;
  version: string;
  createdAt: string;
}

export interface QuestionOption {
  id: number;
  optionText: string;
  optionValue?: number;
  optionOrder: number;
}

export interface Question {
  id: number;
  questionnaireId: number;
  questionText: string;
  questionType: QuestionType;
  questionNumber: number;
  isMandatory: boolean;
  scoringField?: string;
  options: QuestionOption[];
}

export interface QuestionnaireDetail extends Questionnaire {
  questions: Question[];
}

// Assignment and link types
export interface QuestionnaireAssignment {
  id: number;
  patientId: number;
  questionnaireId: number;
  assignedBy: number;
  assignedAt: string;
  completedAt?: string;
  completionPercentage: number;
  isCompleted: boolean;
  questionnaire: Questionnaire;
}

export interface QuestionnaireLink {
  id: number;
  token: string;
  patientId: number;
  linkType: 'all_self' | 'single_other';
  questionnaireId?: number;
  expiresAt: string;
  isExpired: boolean;
  lastAccessedAt?: string;
  createdAt: string;
}

// Response types
export interface Response {
  id: number;
  linkId: number;
  questionId: number;
  responseText?: string;
  responseValue?: number;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionnaireResponse {
  linkId: number;
  responses: {
    [questionId: number]: string | number | string[];
  };
  completedQuestionnaireIds: number[];
}

// Result types
export interface ADHDMetrics {
  disattenzioniSintomi: number;
  disattenzioniPunteggio: number;
  iperattivitaPunteggio: number;
  iperattivitaSintomi: number;
  impulsivitaPunteggio: number;
  impulsivitaSintomi: number;
  iperattivitaImpulsivitaSintomi: number;
  sctPunteggio: number;
  sctSintomi: number;
  etaInizioSintomi: string;
  ambitiCompromissione: string[];
  totaleAdhPunteggio: number;
  totaleAdhSintomi: number;
  iperattivitaImpulsivitaPunteggio: number;
  iperattivitaImpulsivitaSintomi: number;
}

export interface QuestionnaireResult {
  id: number;
  assignmentId: number;
  questionnaireId: number;
  patientId: number;
  calculatedMetrics: ADHDMetrics | Record<string, any>;
  rawScores: Record<string, number>;
  percentileRank?: number;
  statisticalSignificance?: string;
  cutOffStatus: string;
  resultStatus: 'completed' | 'pending' | 'error';
  createdAt: string;
  updatedAt: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  pageSize: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API Error type
export interface APIError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Email log type
export interface EmailLog {
  id: number;
  linkId: number;
  recipientEmail: string;
  sentAt: string;
  deliveryStatus: 'pending' | 'sent' | 'failed' | 'bounced';
  errorMessage?: string;
}

// Audit log type
export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  resourceType: string;
  resourceId: number;
  changes: Record<string, any>;
  createdAt: string;
}
