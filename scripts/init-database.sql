-- Users table (for both clinicians and patients)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('clinician', 'patient')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  sex VARCHAR(20),
  date_of_birth DATE,
  years_of_education INTEGER,
  clinician_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questionnaires table
CREATE TABLE IF NOT EXISTS questionnaires (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('SELF', 'OTHER')),
  category VARCHAR(100),
  question_count INTEGER,
  version VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  questionnaire_id INTEGER REFERENCES questionnaires(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('text', 'single_choice', 'multiple_choice')),
  question_number INTEGER NOT NULL,
  is_mandatory BOOLEAN DEFAULT TRUE,
  scoring_field VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question options (for single/multiple choice)
CREATE TABLE IF NOT EXISTS question_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  option_text VARCHAR(255) NOT NULL,
  option_value INTEGER,
  option_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questionnaire assignments to patients
CREATE TABLE IF NOT EXISTS questionnaire_assignments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  questionnaire_id INTEGER REFERENCES questionnaires(id),
  assigned_by INTEGER REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  completion_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Secure links for questionnaire access
CREATE TABLE IF NOT EXISTS questionnaire_links (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  created_by INTEGER REFERENCES users(id),
  link_type VARCHAR(20) NOT NULL CHECK (link_type IN ('all_self', 'single_other')),
  questionnaire_id INTEGER REFERENCES questionnaires(id),
  expires_at TIMESTAMP,
  is_expired BOOLEAN DEFAULT FALSE,
  last_accessed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questionnaire responses
CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  link_id INTEGER REFERENCES questionnaire_links(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id),
  response_text TEXT,
  response_value INTEGER,
  is_saved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questionnaire results/calculations
CREATE TABLE IF NOT EXISTS questionnaire_results (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES questionnaire_assignments(id) ON DELETE CASCADE,
  questionnaire_id INTEGER REFERENCES questionnaires(id),
  patient_id INTEGER REFERENCES patients(id),
  calculated_metrics JSONB,
  raw_scores JSONB,
  percentile_rank NUMERIC(5,2),
  statistical_significance VARCHAR(50),
  cut_off_status VARCHAR(50),
  result_status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ADHD specific metrics storage
CREATE TABLE IF NOT EXISTS adhd_metrics (
  id SERIAL PRIMARY KEY,
  result_id INTEGER REFERENCES questionnaire_results(id) ON DELETE CASCADE,
  disattenzione_sintomi INTEGER,
  disattenzione_punteggio INTEGER,
  iperattivita_punteggio INTEGER,
  iperattivita_sintomi INTEGER,
  impulsivita_punteggio INTEGER,
  impulsivita_sintomi INTEGER,
  iperattivita_impulsivita_sintomi INTEGER,
  sct_punteggio INTEGER,
  sct_sintomi INTEGER,
  eta_inizio_sintomi VARCHAR(50),
  ambiti_compromissione TEXT,
  totale_adhd_punteggio INTEGER,
  totale_adhd_sintomi INTEGER,
  iperattivita_impulsivita_punteggio INTEGER,
  iperattivita_impulsivita_sintomi INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email logs for tracking sent questionnaire links
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  link_id INTEGER REFERENCES questionnaire_links(id),
  recipient_email VARCHAR(255),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivery_status VARCHAR(50),
  error_message TEXT
);

-- Audit trail for all important actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id INTEGER,
  changes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_patients_clinician_id ON patients(clinician_id);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_questionnaire_assignments_patient_id ON questionnaire_assignments(patient_id);
CREATE INDEX idx_questionnaire_assignments_completed ON questionnaire_assignments(is_completed);
CREATE INDEX idx_questionnaire_links_token ON questionnaire_links(token);
CREATE INDEX idx_questionnaire_links_patient_id ON questionnaire_links(patient_id);
CREATE INDEX idx_responses_link_id ON responses(link_id);
CREATE INDEX idx_questionnaire_results_patient_id ON questionnaire_results(patient_id);
CREATE INDEX idx_questionnaire_results_assignment_id ON questionnaire_results(assignment_id);
CREATE INDEX idx_questions_questionnaire_id ON questions(questionnaire_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
