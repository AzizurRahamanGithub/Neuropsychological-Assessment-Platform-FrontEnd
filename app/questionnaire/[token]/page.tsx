"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

import { ChevronLeft, ChevronRight, AlertCircle, Check } from "lucide-react";

import { useAutoSave } from "@/src/hooks/useAutoSave";
import type { QuestionnaireDetail } from "@/types";
import { QUESTIONNAIRE_REGISTRY } from "@/lib/questionnaires";

interface QuestionnaireState {
  currentQuestionnaireIndex: number;
  responses: {
    [questionnaireId: number]: {
      [questionId: number]: string | number | string[];
    };
  };
  savedAt: Date | null;
}

type UiQuestion = QuestionnaireDetail["questions"][number];
type UiOption = UiQuestion["options"][number];
type UiQuestionType = "single_choice" | "multiple_choice" | "text";

type RegistryOption =
  | string
  | number
  | {
      label?: string;
      value?: string | number;
      id?: string | number;
    };

type RegistryQuestion = {
  text: string;
  type: string;
  required?: boolean;
  options?: RegistryOption[];
};

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

const getModuleByFormCode = (formCode: string) => {
  const modules = Object.values(QUESTIONNAIRE_REGISTRY) as any[];
  return modules.find((m) => m?.def?.formCode === formCode);
};

function normalizeQuestionType(t: unknown): UiQuestionType {
  const s = String(t || "").toLowerCase();
  if (s === "single" || s === "radio" || s === "single_choice") return "single_choice";
  if (s === "multiple" || s === "checkbox" || s === "multiple_choice") return "multiple_choice";
  return "text";
}

/**
 * ✅ IMPORTANT FIX for "single select selects all":
 * Radio values must be UNIQUE & non-empty.
 * We generate optionValue using (rawVal + index).
 */
function buildQuestionnaireDetailsFromCodes(codes: string[]): QuestionnaireDetail[] {
  const list: QuestionnaireDetail[] = [];

  for (const code of codes) {
    const mod: any = getModuleByFormCode(code);
    if (!mod) continue;

    const questionsFromRegistry = (mod.def.questions || []) as RegistryQuestion[];

    const uiQuestions: UiQuestion[] = questionsFromRegistry.map((q: RegistryQuestion, idx: number) => {
      const qType = normalizeQuestionType(q.type);

      const options: UiOption[] =
        qType === "text"
          ? []
          : ((q.options || []) as RegistryOption[]).map((opt: RegistryOption, oidx: number) => {
              const optionText = String((opt as any)?.label ?? opt);
              const rawVal = (opt as any)?.value ?? (opt as any)?.id ?? optionText ?? oidx;
              const optionValue = `${String(rawVal)}__${oidx}`; // ✅ unique always

              return {
                id: oidx + 1,
                optionText,
                optionValue,
              } as UiOption;
            });

      return {
        id: idx + 1,
        questionText: q.text,
        questionType: qType,
        isMandatory: !!q.required,
        options,
      } as UiQuestion;
    });

    list.push({
      id: list.length + 1,
      name: mod.def.name,
      description: mod.def.instruction,
      questions: uiQuestions,
    } as QuestionnaireDetail);
  }

  return list;
}

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function extractPayload(data: any) {
  return data?.data ?? data;
}

function extractErrorMessage(data: any) {
  return (
    data?.message ||
    data?.detail ||
    (typeof data?.error === "string" ? data.error : null) ||
    (data?.error ? JSON.stringify(data.error) : null) ||
    (data?.raw ? String(data.raw) : null) ||
    "Request failed"
  );
}

export default function QuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const token = typeof params?.token === "string" ? params.token : "";

  const [questionnaires, setQuestionnaires] = useState<QuestionnaireDetail[]>([]);
  const [state, setState] = useState<QuestionnaireState>({
    currentQuestionnaireIndex: 0,
    responses: {},
    savedAt: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [unansweredQuestions, setUnansweredQuestions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ LOAD by token
  useEffect(() => {
    console.log("✅ QuestionnairePage MOUNTED", { token, API_BASE });
    const load = async () => {
      try {
        setIsLoading(true);
        setError("");
        setQuestionnaires([]);

        if (!token) throw new Error("Missing token");
        if (!API_BASE) throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");

        const url = `${API_BASE}/questionnaire/links/${token}/`;
        console.log("GET link:", url);

        const res = await fetch(url, { method: "GET", cache: "no-store" });
        const data = await safeJson(res);

        console.log("LINK STATUS:", res.status);
        console.log("LINK BODY:", data);

        if (!res.ok) throw new Error(`[${res.status}] ${extractErrorMessage(data)}`);

        const payload = extractPayload(data);
        const codes: string[] = payload?.questionnaires || payload?.codes || payload?.assigned_questionnaires || [];

        if (payload?.is_submitted) throw new Error("Already submitted");
        if (!Array.isArray(codes) || codes.length === 0) throw new Error("No questionnaires assigned for this link.");

        const qList = buildQuestionnaireDetailsFromCodes(codes);
        if (!qList.length) throw new Error("Assigned questionnaire codes not found in registry (formCode mismatch).");

        setQuestionnaires(qList);

        const savedState = localStorage.getItem(`questionnaire_${token}`);
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            setState(parsed);
          } catch {}
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load questionnaire");
        setQuestionnaires([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [token]);

  // Auto-save local
  const { isSaving, lastSavedAt, saveError } = useAutoSave(state, {
    onSave: async (data) => {
      if (!token) return;
      localStorage.setItem(`questionnaire_${token}`, JSON.stringify(data));
    },
    interval: 5000,
  });

  const currentQuestionnaire = questionnaires[state.currentQuestionnaireIndex];
  const isLastQuestionnaire = state.currentQuestionnaireIndex === questionnaires.length - 1;
  const progressPercentage = questionnaires.length
    ? ((state.currentQuestionnaireIndex + 1) / questionnaires.length) * 100
    : 0;

  const validateCurrentQuestionnaire = useCallback(() => {
    const cq = questionnaires[state.currentQuestionnaireIndex];
    if (!cq) return true;

    const mandatoryQuestions = cq.questions.filter((q: UiQuestion) => q.isMandatory);
    const unanswered = mandatoryQuestions
      .filter((q: UiQuestion) => !state.responses[cq.id]?.[q.id])
      .map((q: UiQuestion) => q.id);

    setUnansweredQuestions(unanswered);
    return unanswered.length === 0;
  }, [questionnaires, state]);

  const handleQuestionResponse = (questionId: number, value: string | number | string[]) => {
    const cq = questionnaires[state.currentQuestionnaireIndex];
    if (!cq) return;

    setState((prev) => ({
      ...prev,
      responses: {
        ...prev.responses,
        [cq.id]: {
          ...(prev.responses[cq.id] || {}),
          [questionId]: value,
        },
      },
      savedAt: new Date(),
    }));
  };

  const handleNext = () => {
    if (!validateCurrentQuestionnaire()) return;

    if (state.currentQuestionnaireIndex < questionnaires.length - 1) {
      setState((prev) => ({ ...prev, currentQuestionnaireIndex: prev.currentQuestionnaireIndex + 1 }));
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (state.currentQuestionnaireIndex > 0) {
      setState((prev) => ({ ...prev, currentQuestionnaireIndex: prev.currentQuestionnaireIndex - 1 }));
      window.scrollTo(0, 0);
    }
  };

  /**
   * ✅ SUBMIT: show logs + show real backend error in UI
   * For now sending raw responses.
   * Later replace with computed_results only.
   */
const handleSubmit = async () => {
  console.log("🔥 SUBMIT CLICKED");
  console.log("token:", token);
  console.log("API_BASE:", API_BASE);

  if (!token) {
    console.error("❌ Missing token param");
    setError("Missing token");
    return;
  }
  if (!API_BASE) {
    console.error("❌ Missing NEXT_PUBLIC_API_BASE_URL");
    setError("Missing NEXT_PUBLIC_API_BASE_URL");
    return;
  }

  try {
    setIsSubmitting(true);
    setError("");

    const url = `${API_BASE}/questionnaire/submit/${token}/`;
    console.log("➡️ POST URL:", url);

    // ✅ BACKEND expects "results" (your 400 says: results required)
    const payload = {
      results: state.responses,
    };

    console.log("➡️ payload:", payload);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("✅ SUBMIT STATUS:", res.status);
    console.log("✅ SUBMIT BODY:", text);

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!res.ok || data?.success === false) {
      const msg =
        data?.message ||
        data?.detail ||
        (data?.error ? JSON.stringify(data.error, null, 2) : null) ||
        text ||
        "Submit failed";

      setError(`Submit failed: ${res.status}\n${msg}`);
      return;
    }

    // ✅ success
    localStorage.removeItem(`questionnaire_${token}`);
    alert("✅ Submit OK");
    router.push("/questionnaire/success");
  } catch (err: any) {
    console.error("❌ FETCH ERROR:", err);
    setError(err?.message || "Submit request failed");
  } finally {
    setIsSubmitting(false);
  }
};


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading questionnaire...</p>
        </div>
      </div>
    );
  }

  if (questionnaires.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Link</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || "This link is invalid."}</AlertDescription>
            </Alert>

            <div className="mt-3 text-xs text-gray-600 break-all">
              token: {token || "-"} <br />
              api: {API_BASE || "(missing NEXT_PUBLIC_API_BASE_URL)"} <br />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Questionnaire {state.currentQuestionnaireIndex + 1} of {questionnaires.length}
            </h1>

            {saveError && <div className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded">Save error</div>}
            {!saveError && lastSavedAt && (
              <div className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded flex items-center gap-1">
                <Check size={12} />
                Saved
              </div>
            )}
          </div>

          <Progress value={progressPercentage} className="h-2" />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription style={{ whiteSpace: "pre-wrap" }}>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle>{currentQuestionnaire.name}</CardTitle>
            <CardDescription>{currentQuestionnaire.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {currentQuestionnaire.questions.map((question: UiQuestion, index: number) => (
              <div
                key={question.id}
                className={`pb-6 border-b last:border-b-0 ${
                  unansweredQuestions.includes(question.id) ? "bg-red-50 p-4 rounded" : ""
                }`}
              >
                <Label className="block text-base font-semibold text-gray-900 mb-3">
                  {index + 1}. {question.questionText}
                  {question.isMandatory && <span className="text-red-600 ml-1">*</span>}
                </Label>

                {/* SINGLE */}
                {question.questionType === "single_choice" && (
                  <RadioGroup
                    value={String(state.responses[currentQuestionnaire.id]?.[question.id] ?? "")}
                    onValueChange={(value) => handleQuestionResponse(question.id, value)}
                  >
                    <div className="space-y-2">
                      {question.options.map((option: UiOption) => (
                        <div key={option.id} className="flex items-center gap-3">
                          <RadioGroupItem
                            value={String(option.optionValue)} // ✅ unique
                            id={`option-${question.id}-${option.id}`}
                          />
                          <Label htmlFor={`option-${question.id}-${option.id}`} className="font-normal cursor-pointer">
                            {option.optionText}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {/* MULTIPLE */}
                {question.questionType === "multiple_choice" && (
                  <div className="space-y-2">
                    {question.options.map((option: UiOption) => {
                      const currentValues =
                        (state.responses[currentQuestionnaire.id]?.[question.id] as string[]) || [];
                      const val = String(option.optionValue);
                      const checked = currentValues.includes(val);

                      return (
                        <div key={option.id} className="flex items-center gap-3">
                          <Checkbox
                            id={`option-${question.id}-${option.id}`}
                            checked={checked}
                            onCheckedChange={(c) => {
                              const newValues = c
                                ? Array.from(new Set([...currentValues, val]))
                                : currentValues.filter((v) => v !== val);
                              handleQuestionResponse(question.id, newValues);
                            }}
                          />
                          <Label htmlFor={`option-${question.id}-${option.id}`} className="font-normal cursor-pointer">
                            {option.optionText}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TEXT */}
                {question.questionType === "text" && (
                  <Input
                    placeholder="Enter your answer..."
                    value={String(state.responses[currentQuestionnaire.id]?.[question.id] ?? "")}
                    onChange={(e) => handleQuestionResponse(question.id, e.target.value)}
                    className="mt-2"
                  />
                )}

                {unansweredQuestions.includes(question.id) && (
                  <p className="text-sm text-red-600 mt-2">Please answer this question.</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={state.currentQuestionnaireIndex === 0}
            className="gap-2 bg-transparent"
          >
            <ChevronLeft size={20} />
            Previous
          </Button>

          {isLastQuestionnaire ? (
<Button
  type="button"
  onClick={async () => {
    console.log("🔥 SUBMIT CLICKED");
    try {
      await handleSubmit(); // ✅ MUST be awaited so errors show
    } catch (e) {
      console.error("❌ handleSubmit threw:", e);
    }
  }}
  className="flex-1 gap-2"
>
  Submit
</Button>

          ) : (
            <Button onClick={handleNext} disabled={unansweredQuestions.length > 0} className="flex-1 gap-2">
              Next
              <ChevronRight size={20} />
            </Button>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isSaving && "Saving..."}
          {!isSaving && lastSavedAt && `Last saved: ${lastSavedAt.toLocaleTimeString("en-US")}`}
        </div>
      </div>
    </main>
  );
}
