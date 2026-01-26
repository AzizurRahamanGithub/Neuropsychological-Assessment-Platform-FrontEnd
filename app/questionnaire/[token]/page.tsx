'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, AlertCircle, Check } from 'lucide-react';
import { useAutoSave } from '@/src/hooks/useAutoSave';
import type { QuestionnaireDetail, Response } from '@/types';

interface QuestionnaireState {
  currentQuestionnaireIndex: number;
  responses: {
    [questionnaireId: number]: {
      [questionId: number]: string | number | string[];
    };
  };
  savedAt: Date | null;
}
import { QUESTIONNAIRE_REGISTRY } from "@/lib/questionnaires";

const getModuleByFormCode = (formCode: string) => {
  return QUESTIONNAIRE_REGISTRY.find((m) => m.def.formCode === formCode);
};

export default function QuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [questionnaires, setQuestionnaires] = useState<QuestionnaireDetail[]>([]);
  const [state, setState] = useState<QuestionnaireState>({
    currentQuestionnaireIndex: 0,
    responses: {},
    savedAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [unansweredQuestions, setUnansweredQuestions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load questionnaires and resume progress
  useEffect(() => {
    const loadQuestionnaires = async () => {
      try {
        setIsLoading(true);

        // Try to resume progress from localStorage
        const savedState = localStorage.getItem(`questionnaire_${token}`);
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            setState(parsed);
          } catch {
            // Invalid saved state, start fresh
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load questionnaire');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestionnaires();
  }, [token]);

  // Auto-save to localStorage
  const { isSaving, lastSavedAt, saveError } = useAutoSave(state, {
    onSave: async (data) => {
      localStorage.setItem(`questionnaire_${token}`, JSON.stringify(data));
      
      // TODO: Also save to server
      // await apiClient.post('/api/responses/', {
      //   linkId: ...,
      //   responses: data.responses[...]
      // });
    },
    interval: 5000, // 5 seconds
  });

  // Validate current questionnaire
  const validateCurrentQuestionnaire = useCallback(() => {
    const currentQuestionnaire = questionnaires[state.currentQuestionnaireIndex];
    if (!currentQuestionnaire) return true;

    const mandatoryQuestions = currentQuestionnaire.questions.filter((q) => q.isMandatory);
    const unanswered = mandatoryQuestions
      .filter((q) => !state.responses[currentQuestionnaire.id]?.[q.id])
      .map((q) => q.id);

    setUnansweredQuestions(unanswered);
    return unanswered.length === 0;
  }, [questionnaires, state]);

  // Handle question response
  const handleQuestionResponse = (questionId: number, value: string | number | string[]) => {
    const currentQuestionnaire = questionnaires[state.currentQuestionnaireIndex];
    
    setState((prev) => ({
      ...prev,
      responses: {
        ...prev.responses,
        [currentQuestionnaire.id]: {
          ...prev.responses[currentQuestionnaire.id] || {},
          [questionId]: value,
        },
      },
      savedAt: new Date(),
    }));
  };

  // Navigate to next questionnaire
  const handleNext = () => {
    if (!validateCurrentQuestionnaire()) {
      return;
    }

    if (state.currentQuestionnaireIndex < questionnaires.length - 1) {
      setState((prev) => ({
        ...prev,
        currentQuestionnaireIndex: prev.currentQuestionnaireIndex + 1,
      }));
      window.scrollTo(0, 0);
    }
  };

  // Navigate to previous questionnaire
  const handlePrevious = () => {
    if (state.currentQuestionnaireIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentQuestionnaireIndex: prev.currentQuestionnaireIndex - 1,
      }));
      window.scrollTo(0, 0);
    }
  };

  // Submit all questionnaires
  const handleSubmit = async () => {
    if (!validateCurrentQuestionnaire()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: Submit to backend
      // await apiClient.post('/api/links/{token}/submit/', {
      //   responses: state.responses,
      // });

      // Clear saved state
      localStorage.removeItem(`questionnaire_${token}`);

      // Show success message and redirect
      alert('Grazie! Il tuo questionario è stato inviato con successo.');
      router.push('/questionnaire/success');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit questionnaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento del questionario...</p>
        </div>
      </div>
    );
  }

  if (questionnaires.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Link Non Valido</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Questo link è scaduto o non è valido.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestionnaire = questionnaires[state.currentQuestionnaireIndex];
  const isLastQuestionnaire = state.currentQuestionnaireIndex === questionnaires.length - 1;
  const progressPercentage = ((state.currentQuestionnaireIndex + 1) / questionnaires.length) * 100;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Questionario {state.currentQuestionnaireIndex + 1} di {questionnaires.length}
            </h1>
            {saveError && (
              <div className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded">
                Errore nel salvataggio
              </div>
            )}
            {!saveError && lastSavedAt && (
              <div className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded flex items-center gap-1">
                <Check size={12} />
                Salvato
              </div>
            )}
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Questionnaire Card */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle>{currentQuestionnaire.name}</CardTitle>
            <CardDescription>{currentQuestionnaire.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Questions */}
            {currentQuestionnaire.questions.map((question, index) => (
              <div
                key={question.id}
                className={`pb-6 border-b last:border-b-0 ${
                  unansweredQuestions.includes(question.id) ? 'bg-red-50 p-4 rounded' : ''
                }`}
              >
                <Label className="block text-base font-semibold text-gray-900 mb-3">
                  {index + 1}. {question.questionText}
                  {question.isMandatory && <span className="text-red-600 ml-1">*</span>}
                </Label>

                {question.questionType === 'single_choice' && (
                  <RadioGroup
                    value={
                      state.responses[currentQuestionnaire.id]?.[question.id]?.toString() || ''
                    }
                    onValueChange={(value) => handleQuestionResponse(question.id, value)}
                  >
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center gap-3">
                          <RadioGroupItem
                            value={option.optionValue?.toString() || ''}
                            id={`option-${question.id}-${option.id}`}
                          />
                          <Label
                            htmlFor={`option-${question.id}-${option.id}`}
                            className="font-normal cursor-pointer"
                          >
                            {option.optionText}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {question.questionType === 'multiple_choice' && (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <div key={option.id} className="flex items-center gap-3">
                        <Checkbox
                          id={`option-${question.id}-${option.id}`}
                          checked={
                            (state.responses[currentQuestionnaire.id]?.[question.id] as string[])?.includes(
                              option.optionText,
                            ) || false
                          }
                          onCheckedChange={(checked) => {
                            const currentValues = (
                              state.responses[currentQuestionnaire.id]?.[question.id] as string[]
                            ) || [];
                            const newValues = checked
                              ? [...currentValues, option.optionText]
                              : currentValues.filter((v) => v !== option.optionText);
                            handleQuestionResponse(question.id, newValues);
                          }}
                        />
                        <Label
                          htmlFor={`option-${question.id}-${option.id}`}
                          className="font-normal cursor-pointer"
                        >
                          {option.optionText}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {question.questionType === 'text' && (
                  <Input
                    placeholder="Inserisci la risposta..."
                    value={state.responses[currentQuestionnaire.id]?.[question.id] || ''}
                    onChange={(e) => handleQuestionResponse(question.id, e.target.value)}
                    className="mt-2"
                  />
                )}

                {unansweredQuestions.includes(question.id) && (
                  <p className="text-sm text-red-600 mt-2">Per favore risponda a questa domanda</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={state.currentQuestionnaireIndex === 0}
            className="gap-2 bg-transparent"
          >
            <ChevronLeft size={20} />
            Precedente
          </Button>

          {isLastQuestionnaire ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isSaving}
              className="flex-1 gap-2"
            >
              {isSubmitting ? 'Invio in corso...' : 'Invia'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={unansweredQuestions.length > 0}
              className="flex-1 gap-2"
            >
              Seguente
              <ChevronRight size={20} />
            </Button>
          )}
        </div>

        {/* Save Status */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {isSaving && 'Salvataggio in corso...'}
          {!isSaving && lastSavedAt && `Ultimo salvataggio: ${lastSavedAt.toLocaleTimeString('it-IT')}`}
        </div>
      </div>
    </main>
  );
}
