'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import type { QuestionnaireType, QuestionType } from '@/types';

interface QuestionOption {
  id: string;
  text: string;
  value?: number;
  order: number;
}

interface FormQuestion {
  id: string;
  number: number;
  text: string;
  type: QuestionType;
  isMandatory: boolean;
  scoringField?: string[];
  options: QuestionOption[];
}

interface FormData {
  code: string;
  name: string;
  description: string;
  type: QuestionnaireType;
  version: string;
  questions: FormQuestion[];
}

type InformantRelationship =
  | 'mother'
  | 'father'
  | 'partner'
  | 'spouse'
  | 'sibling'
  | 'caregiver'
  | 'other';

  interface FormData {
  code: string;
  name: string;
  description: string;
  type: QuestionnaireType;
  version: string;
  questions: FormQuestion[];
  informantRelationship?: InformantRelationship; // ✅ add
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'text', label: 'Text Input' },
  { value: 'single_choice', label: 'Single Choice (Radio)' },
  { value: 'multiple_choice', label: 'Multiple Choice (Checkboxes)' },
];

const QUESTIONNAIRE_TYPES: { value: QuestionnaireType; label: string }[] = [
  { value: 'SELF', label: 'Self-Report' },
  { value: 'OTHER', label: 'Other-Report' },
];

const SCORING_FIELDS = [
  'disattenzione',
  'iperattivita',
  'impulsivita',
  'sct',
  'eta_inizio',
  'ambiti_compromissione',
  'diagnosi_precedente',
];

export default function AddQuestionnairePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    description: '',
    type: 'SELF',
    version: '1.0',
    questions: [],
      informantRelationship: undefined,
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<FormQuestion>({
    id: Math.random().toString(),
    number: 1,
    text: '',
    type: 'single_choice',
    isMandatory: true,
    options: [],
  });
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);

  const handleBasicChange = (field: keyof Omit<FormData, 'questions'>, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.text.trim()) {
      setError('Please enter question text');
      return;
    }

    if (currentQuestion.type !== 'text' && currentQuestion.options.length === 0) {
      setError('Please add at least one option for this question');
      return;
    }

    const questionWithNumber = {
      ...currentQuestion,
      number: formData.questions.length + 1,
    };

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, questionWithNumber],
    }));

    setCurrentQuestion({
      id: Math.random().toString(),
      number: formData.questions.length + 2,
      text: '',
      type: 'single_choice',
      isMandatory: true,
      options: [],
    });

    setShowQuestionDialog(false);
    setError('');
  };

  const handleRemoveQuestion = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions
        .filter((q) => q.id !== id)
        .map((q, idx) => ({ ...q, number: idx + 1 })),
    }));
  };

  const handleAddOption = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: Math.random().toString(),
          text: '',
          value: prev.options.length,
          order: prev.options.length + 1,
        },
      ],
    }));
  };

  const handleRemoveOption = (optionId: string) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options
        .filter((o) => o.id !== optionId)
        .map((o, idx) => ({ ...o, order: idx + 1 })),
    }));
  };

  const handleOptionChange = (
    optionId: string,
    field: 'text' | 'value',
    value: any,
  ) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.map((o) =>
        o.id === optionId
          ? { ...o, [field]: field === 'value' ? Number(value) : value }
          : o,
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.code.trim()) {
      setError('Questionnaire code is required');
      return;
    }
    if (!formData.name.trim()) {
      setError('Questionnaire name is required');
      return;
    }
    if (formData.questions.length === 0) {
      setError('Please add at least one question');
      return;
    }
    if (formData.type === 'OTHER' && !formData.informantRelationship) {
  setError('Please select who is completing the questionnaire (required for Other-Report).');
  return;
}


    try {
      setIsSubmitting(true);

      // Simulate API call
      console.log('Submitting questionnaire:', formData);

      // Mock success response
      setTimeout(() => {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/dashboard/questionnaires');
        }, 2000);
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Failed to create questionnaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard/questionnaires">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Questionnaire</h1>
          <p className="text-gray-600 mt-1">Define questions, options, and scoring criteria</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-700" />
          <AlertDescription className="text-green-700">
            Questionnaire created successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Define the questionnaire details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Questionnaire Code *
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => handleBasicChange('code', e.target.value)}
                  placeholder="e.g., BAARS_IV"
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier (uppercase)</p>
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version *
                </label>
                <Input
                  value={formData.version}
                  onChange={(e) => handleBasicChange('version', e.target.value)}
                  placeholder="e.g., 1.0"
                />
              </div> */}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Questionnaire Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleBasicChange('name', e.target.value)}
                placeholder="Full questionnaire name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleBasicChange('description', e.target.value)}
                placeholder="Brief description of the questionnaire"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
<Select
  value={formData.type}
  onValueChange={(value) => {
    const nextType = value as QuestionnaireType;
    setFormData((prev) => ({
      ...prev,
      type: nextType,
      informantRelationship: nextType === 'OTHER' ? prev.informantRelationship : undefined,
    }));
  }}
>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTIONNAIRE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>

{formData.type === 'OTHER' && (
  <div className="mt-4 border rounded-lg p-4 mx-5 bg-blue-50/50">
    <p className="text-sm font-semibold text-gray-900 mb-1">
      Informant Details (Required)
    </p>
    <p className="text-xs text-gray-600 mb-3">
      This questionnaire will be filled by someone other than the patient.
      Please select who is completing it. This field must be filled when "Other-Report" is selected.
    </p>

    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Who is completing this questionnaire? *
      </label>

      <div className=" flex gap-2.5">
        {[
          { value: 'mother', label: 'Mother' },
          { value: 'father', label: 'Father' },
          { value: 'partner', label: 'Partner' },
          { value: 'spouse', label: 'Spouse' },
          { value: 'sibling', label: 'Sibling' },
          { value: 'caregiver', label: 'Caregiver' },
          { value: 'other', label: 'Other' },
        ].map((item) => (
          <label
            key={item.value}
            className="  inline-flex gap-2 rounded-md border bg-white px-3 py-2 cursor-pointer hover:bg-gray-50"
          >
            <input
              type="radio"
              name="informantRelationship"
              value={item.value}
              checked={formData.informantRelationship === item.value}
              onChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  informantRelationship: item.value as InformantRelationship,
                }))
              }
            />
            <span className="text-sm text-gray-800">{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
)}


        </Card>

        {/* Questions Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Questions ({formData.questions.length})</CardTitle>
              <CardDescription>Add and configure all questions</CardDescription>
            </div>
            <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={20} />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full  overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Question #{formData.questions.length + 1}</DialogTitle>
                  <DialogDescription>
                    Configure the question text, type, and answer options
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Text *
                    </label>
                    <textarea
                      value={currentQuestion.text}
                      onChange={(e) =>
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          text: e.target.value,
                        }))
                      }
                      placeholder="Enter the question text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Type *
                      </label>
                      <Select
                        value={currentQuestion.type}
                        onValueChange={(value) =>
                          setCurrentQuestion((prev) => ({
                            ...prev,
                            type: value as QuestionType,
                            options: [],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUESTION_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scoring Field
                      </label>

                      {(() => {
                        const selected = currentQuestion.scoringField ?? [];

                        const toggle = (field: string) => {
                          setCurrentQuestion((prev) => {
                            const prevSelected = prev.scoringField ?? [];
                            const exists = prevSelected.includes(field);

                            return {
                              ...prev,
                              scoringField: exists
                                ? prevSelected.filter((x) => x !== field)
                                : [...prevSelected, field],
                            };
                          });
                        };

                        const clearAll = () => {
                          setCurrentQuestion((prev) => ({ ...prev, scoringField: [] }));
                        };

                        return (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-full justify-between">
                                {selected.length ? selected.join(", ") : "None"}
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-64 overflow-auto">
                              <DropdownMenuLabel>Scoring Fields</DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              <DropdownMenuCheckboxItem
                                checked={selected.length === 0}
                                onCheckedChange={() => clearAll()}
                              >
                                None
                              </DropdownMenuCheckboxItem>

                              <DropdownMenuSeparator />

                              {SCORING_FIELDS.map((field) => (
                                <DropdownMenuCheckboxItem
                                  key={field}
                                  checked={selected.includes(field)}
                                  onCheckedChange={() => toggle(field)}
                                >
                                  {field}
                                </DropdownMenuCheckboxItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        );
                      })()}
                    </div>

                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="mandatory"
                      checked={currentQuestion.isMandatory}
                      onCheckedChange={(checked) =>
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          isMandatory: Boolean(checked),
                        }))
                      }
                    />
                    <label htmlFor="mandatory" className="text-sm text-gray-700 cursor-pointer">
                      This is a mandatory question
                    </label>
                  </div>

                  {currentQuestion.type !== 'text' && (
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          Answer Options *
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddOption}
                        >
                          <Plus size={16} />
                          Add Option
                        </Button>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {currentQuestion.options.map((option, idx) => (
                          <div key={option.id} className="flex gap-2 items-end">
                            <div className="flex-1">
                              <label className="text-xs text-gray-600">Option {idx + 1}</label>
                              <Input
                                value={option.text}
                                onChange={(e) =>
                                  handleOptionChange(option.id, 'text', e.target.value)
                                }
                                placeholder="Option text"
                                className="text-sm"
                              />
                            </div>
                            <div className="w-20">
                              <label className="text-xs text-gray-600">Value</label>
                              <Input
                                type="number"
                                value={idx + 1}
                                onChange={(e) =>
                                  handleOptionChange(option.id, 'value', e.target.value)
                                }
                                className="text-sm"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOption(option.id)}
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowQuestionDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleAddQuestion}>
                    <Plus size={16} className="mr-2" />
                    Add Question
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>

          <CardContent>
            {formData.questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No questions added yet. Click "Add Question" to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.questions.map((question) => (
                  <div
                    key={question.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Q{question.number}: {question.text}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {question.type}
                          </span>
                          {question.scoringField && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                              {question.scoringField}
                            </span>
                          )}
                          {!question.isMandatory && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                              Optional
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveQuestion(question.id)}
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </Button>
                    </div>

                    {question.options.length > 0 && (
                      <div className="mt-3 ml-4 space-y-1">
                        {question.options.map((option) => (
                          <p key={option.id} className="text-sm text-gray-600">
                            • {option.text} (value: {option.value})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Link href="/admin/dashboard/questionnaires" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting || formData.questions.length === 0}
            className="flex-1 gap-2"
          >
            <Save size={20} />
            Create Questionnaire
          </Button>
        </div>
      </form>
    </div>
  );
}
