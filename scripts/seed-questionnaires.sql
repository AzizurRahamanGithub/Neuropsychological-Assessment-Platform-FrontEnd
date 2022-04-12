-- Seed sample questionnaires including Barkley Adult ADHD Rating Scale-IV

-- Insert questionnaires
INSERT INTO questionnaires (code, name, description, type, category, question_count, version) VALUES
('BAARS_IV', 'Barkley Adult ADHD Rating Scale-IV', 'Comprehensive ADHD assessment for adults', 'SELF', 'ADHD Assessment', 27, 'IV'),
('CONNERS_ADHD', 'Conners ADHD Rating Scale', 'ADHD symptoms assessment', 'SELF', 'ADHD Assessment', 30, 'v3'),
('SNAP_IV', 'Swanson, Nolan, and Pelham Rating Scale', 'Parent and teacher rating scale', 'OTHER', 'ADHD Assessment', 26, 'IV'),
('CANTAB', 'Cambridge Neuropsychological Test Automated Battery', 'Cognitive assessment battery', 'SELF', 'Neuropsychological', 45, '6.0'),
('MOXO', 'Monotask and Dual-Task Performance Test', 'Continuous attention and impulsivity', 'SELF', 'Attention', 15, '2.0')
ON CONFLICT (code) DO NOTHING;

-- Get questionnaire IDs for reference
DO $$
DECLARE
  baars_id INT;
  conners_id INT;
  snap_id INT;
BEGIN
  SELECT id INTO baars_id FROM questionnaires WHERE code = 'BAARS_IV';
  SELECT id INTO conners_id FROM questionnaires WHERE code = 'CONNERS_ADHD';
  SELECT id INTO snap_id FROM questionnaires WHERE code = 'SNAP_IV';

  -- Insert questions for Barkley Adult ADHD Rating Scale-IV (SELF)
  INSERT INTO questions (questionnaire_id, question_text, question_type, question_number, scoring_field) VALUES
  (baars_id, 'Difficoltà a concentrarsi su compiti o attività', 'single_choice', 1, 'disattenzione'),
  (baars_id, 'Procrastinazione o difficoltà ad iniziare attività', 'single_choice', 2, 'disattenzione'),
  (baars_id, 'Distrazione durante il lavoro', 'single_choice', 3, 'disattenzione'),
  (baars_id, 'Difficoltà a completare compiti', 'single_choice', 4, 'disattenzione'),
  (baars_id, 'Disorganizzazione nei compiti', 'single_choice', 5, 'disattenzione'),
  (baars_id, 'Difficoltà a pianificare attività', 'single_choice', 6, 'disattenzione'),
  (baars_id, 'Perdita frequente di oggetti importanti', 'single_choice', 7, 'disattenzione'),
  (baars_id, 'Dimenticanza nelle attività quotidiane', 'single_choice', 8, 'disattenzione'),
  (baars_id, 'Irrequietezza durante sessioni sedentarie', 'single_choice', 9, 'iperattivita'),
  (baars_id, 'Necessità di muoversi durante le riunioni', 'single_choice', 10, 'iperattivita'),
  (baars_id, 'Difficoltà a restare seduto', 'single_choice', 11, 'iperattivita'),
  (baars_id, 'Eccessiva attività o parlantina', 'single_choice', 12, 'iperattivita'),
  (baars_id, 'Impazienza', 'single_choice', 13, 'impulsivita'),
  (baars_id, 'Difficoltà ad aspettare il turno', 'single_choice', 14, 'impulsivita'),
  (baars_id, 'Interruzione degli altri durante conversazioni', 'single_choice', 15, 'impulsivita'),
  (baars_id, 'Difficoltà a controllare le emozioni', 'single_choice', 16, 'iperattivita'),
  (baars_id, 'Scatti di rabbia', 'single_choice', 17, 'iperattivita'),
  (baars_id, 'Facilità a demotivarsi', 'single_choice', 18, 'disattenzione'),
  (baars_id, 'Affaticamento mentale', 'single_choice', 19, 'disattenzione'),
  (baars_id, 'A che età hai notato questi sintomi?', 'text', 20, 'eta_inizio'),
  (baars_id, 'Aree di vita compromesse (lavoro/scuola)', 'multiple_choice', 21, 'ambiti_compromissione'),
  (baars_id, 'Aree di vita compromesse (relazioni)', 'multiple_choice', 22, 'ambiti_compromissione'),
  (baars_id, 'Aree di vita compromesse (attività ricreative)', 'multiple_choice', 23, 'ambiti_compromissione'),
  (baars_id, 'Aree di vita compromesse (autostima)', 'multiple_choice', 24, 'ambiti_compromissione'),
  (baars_id, 'Aree di vita compromesse (guida)', 'multiple_choice', 25, 'ambiti_compromissione'),
  (baars_id, 'Hai mai subito un trauma o evento stressante significativo?', 'single_choice', 26, 'sct'),
  (baars_id, 'Hai ricevuto precedentemente una diagnosi di ADHD?', 'single_choice', 27, 'diagnosi_precedente');

  -- Insert question options for Likert scale (0=Never, 1=Rarely, 2=Sometimes, 3=Often, 4=Very Often)
  INSERT INTO question_options (question_id, option_text, option_value, option_order)
  SELECT id, 'Mai (0)', 0, 1 FROM questions WHERE questionnaire_id = baars_id AND question_number <= 19
  UNION ALL
  SELECT id, 'Raramente (1)', 1, 2 FROM questions WHERE questionnaire_id = baars_id AND question_number <= 19
  UNION ALL
  SELECT id, 'A volte (2)', 2, 3 FROM questions WHERE questionnaire_id = baars_id AND question_number <= 19
  UNION ALL
  SELECT id, 'Spesso (3)', 3, 4 FROM questions WHERE questionnaire_id = baars_id AND question_number <= 19
  UNION ALL
  SELECT id, 'Molto spesso (4)', 4, 5 FROM questions WHERE questionnaire_id = baars_id AND question_number <= 19;

  -- Options for yes/no questions
  INSERT INTO question_options (question_id, option_text, option_value, option_order)
  SELECT id, 'Sì', 1, 1 FROM questions WHERE questionnaire_id = baars_id AND question_number IN (26, 27)
  UNION ALL
  SELECT id, 'No', 0, 2 FROM questions WHERE questionnaire_id = baars_id AND question_number IN (26, 27);

  -- Options for age onset
  INSERT INTO question_options (question_id, option_text, option_value, option_order)
  SELECT id, 'Prima dei 12 anni', 1, 1 FROM questions WHERE questionnaire_id = baars_id AND question_number = 20
  UNION ALL
  SELECT id, '12-17 anni', 2, 2 FROM questions WHERE questionnaire_id = baars_id AND question_number = 20
  UNION ALL
  SELECT id, '18+ anni', 3, 3 FROM questions WHERE questionnaire_id = baars_id AND question_number = 20;

  -- Options for impairment areas
  INSERT INTO question_options (question_id, option_text, option_value, option_order)
  SELECT id, 'Sì', 1, 1 FROM questions WHERE questionnaire_id = baars_id AND question_number BETWEEN 21 AND 25
  UNION ALL
  SELECT id, 'No', 0, 2 FROM questions WHERE questionnaire_id = baars_id AND question_number BETWEEN 21 AND 25;

END $$;

-- Insert sample test data
DO $$
DECLARE
  clinician_id INT;
  patient_id INT;
  user_id INT;
BEGIN
  -- Create a sample clinician user (if needed for reference)
  INSERT INTO users (username, email, password_hash, first_name, last_name, user_type)
  VALUES ('dr_smith', 'dr.smith@clinic.com', 'hashed_password_123', 'Dr.', 'Smith', 'clinician')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO clinician_id;

  -- Get clinician ID if it already exists
  IF clinician_id IS NULL THEN
    SELECT id INTO clinician_id FROM users WHERE email = 'dr.smith@clinic.com';
  END IF;

  -- Create a sample patient
  INSERT INTO users (username, email, password_hash, first_name, last_name, user_type)
  VALUES ('patient_001', 'patient1@example.com', 'hashed_password_456', 'Giovanni', 'Rossi', 'patient')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO user_id;

  IF user_id IS NULL THEN
    SELECT id INTO user_id FROM users WHERE email = 'patient1@example.com';
  END IF;

  -- Create patient profile
  INSERT INTO patients (user_id, name, surname, sex, date_of_birth, years_of_education, clinician_id)
  VALUES (user_id, 'Giovanni', 'Rossi', 'M', '1990-05-15'::DATE, 13, clinician_id)
  ON CONFLICT DO NOTHING
  RETURNING id INTO patient_id;

  IF patient_id IS NULL THEN
    SELECT id INTO patient_id FROM patients WHERE name = 'Giovanni' AND surname = 'Rossi';
  END IF;

END $$;
