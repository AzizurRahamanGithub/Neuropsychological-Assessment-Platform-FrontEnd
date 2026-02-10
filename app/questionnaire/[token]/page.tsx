"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
type UiQuestionType =
  | "single_choice"
  | "multiple_choice"
  | "text"
  | "instruction";
type RegistryOption =
  | string
  | number
  | {
      label?: string;
      value?: string | number;
      id?: string | number;
    };

type RegistryQuestion = {
  key?: string; // defs use q1..
  text: string;
  type: string;
  required?: boolean;
  options?: RegistryOption[];
};

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
  /\/$/,
  "",
);

const getModuleByFormCode = (formCode: string) => {
  return (QUESTIONNAIRE_REGISTRY as any)?.[formCode] ?? null;
};

function normalizeQuestionType(t: unknown): UiQuestionType | "instruction" {
  const s = String(t || "").toLowerCase();
  if (s === "instruction") return "instruction";
  if (s === "single" || s === "radio" || s === "single_choice")
    return "single_choice";
  if (s === "multiple" || s === "checkbox" || s === "multiple_choice")
    return "multiple_choice";
  return "text";
}

function stripUiSuffix(v: unknown) {
  if (typeof v !== "string") return v;
  return v.split("__")[0];
}

function buildQuestionnaireDetailsFromCodes(
  codes: string[],
): QuestionnaireDetail[] {
  const list: QuestionnaireDetail[] = [];

  for (const formCode of codes) {
    const mod: any = getModuleByFormCode(formCode);
    if (!mod?.def) continue;

    const questionsFromRegistry = (mod.def.questions ||
      []) as RegistryQuestion[];

    const uiQuestions: UiQuestion[] = questionsFromRegistry.map((q, idx) => {
      const qType = normalizeQuestionType(q.type);

      const options: UiOption[] =
        qType === "text"
          ? []
          : ((q.options || []) as RegistryOption[]).map((opt, oidx) => {
              const optionText = String((opt as any)?.label ?? opt);
              const rawVal =
                (opt as any)?.value ?? (opt as any)?.id ?? optionText ?? oidx;

              // ✅ unique per option (fix radio selecting all)
              const optionValue = `${String(rawVal)}__${oidx}`;

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
        ...({ questionKey: q.key ?? `q${idx + 1}` } as any),
      } as UiQuestion;
    });

    list.push({
      id: list.length + 1,
      name: mod.def.name,
      description: mod.def.instruction,
      questions: uiQuestions,
      ...({ formCode: mod.def.formCode } as any),
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

  const [questionnaires, setQuestionnaires] = useState<QuestionnaireDetail[]>(
    [],
  );
  const [patientAge, setPatientAge] = useState<number | null>(null);
  const [patientSex, setPatientSex] = useState<string | null>(null); // "female" | "male"
  const [patientEducation, setPatientEducation] = useState<number | null>(null);

  const [state, setState] = useState<QuestionnaireState>({
    currentQuestionnaireIndex: 0,
    responses: {},
    savedAt: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [unansweredQuestions, setUnansweredQuestions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ NEW: link type + submitted by selection (ONLY for OTHER)
  const [linkType, setLinkType] = useState<"all_self" | "single_other" | "">(
    "",
  );
  const [submittedBy, setSubmittedBy] = useState<string>(""); // Madre/Padre/.../Altro
  const [submittedByOther, setSubmittedByOther] = useState<string>(""); // if Altro

  // ✅ LOAD by token
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError("");
        setQuestionnaires([]);

        if (!token) throw new Error("Missing token");
        if (!API_BASE) throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");

        const url = `${API_BASE}/questionnaire/links/${token}/`;
        const res = await fetch(url, { method: "GET", cache: "no-store" });
        const data = await safeJson(res);

        if (!res.ok)
          throw new Error(`[${res.status}] ${extractErrorMessage(data)}`);

        const payload = extractPayload(data);

        const ps =
          payload?.patient_sex ??
          payload?.patientSex ??
          payload?.patient?.sex ??
          null;

        setPatientSex(ps ? String(ps).toLowerCase() : null);

        console.log("✅ patient_sex from GET:", ps);

        // 1. Extract the raw value using the same fallback chain logic
        const pe =
          payload?.patient_education ??
          payload?.patientEducation ??
          payload?.patient?.education ??
          null;

        // 2. Convert to number if possible, or keep as raw value if it's a string
        // Note: We use Number(pe) only if pe is truthy to avoid converting null to 0
        const peNum = typeof pe === "number" ? pe : pe ? Number(pe) : null;

        // 3. Set the state, ensuring it's a finite number; otherwise, default to null
        // If you actually WANT the string "101", keep the Number.isFinite check
        setPatientEducation(Number.isFinite(peNum) ? peNum : null);

        console.log("✅ patient_Education from GET:", peNum);

        const pa =
          payload?.patient_age ??
          payload?.patientAge ??
          payload?.patient?.patient_age ??
          payload?.patient?.age ??
          payload?.assignment?.patient_age ??
          payload?.data?.patient_age ??
          null;

        const paNum = typeof pa === "number" ? pa : pa ? Number(pa) : null;
        setPatientAge(Number.isFinite(paNum as any) ? (paNum as number) : null);

        // ✅ detect link_type (support different payload shapes)
        const lt =
          payload?.link_type ||
          payload?.link?.link_type ||
          payload?.data?.link_type ||
          "";
        setLinkType(lt);

        const codes: string[] =
          payload?.questionnaires ||
          payload?.codes ||
          payload?.assigned_questionnaires ||
          [];

        if (payload?.is_submitted) throw new Error("Already submitted");
        if (!Array.isArray(codes) || codes.length === 0)
          throw new Error("No questionnaires assigned for this link.");

        const qList = buildQuestionnaireDetailsFromCodes(codes);
        if (!qList.length)
          throw new Error(
            "Assigned questionnaire codes not found in registry (formCode mismatch).",
          );

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
  const isLastQuestionnaire =
    state.currentQuestionnaireIndex === questionnaires.length - 1;
  const progressPercentage = questionnaires.length
    ? ((state.currentQuestionnaireIndex + 1) / questionnaires.length) * 100
    : 0;

  const validateCurrentQuestionnaire = useCallback(() => {
    const cq = questionnaires[state.currentQuestionnaireIndex];
    if (!cq) return true;

    const mandatoryQuestions = cq.questions.filter(
      (q: UiQuestion) => q.isMandatory && q.questionType !== "instruction",
    );

    const unanswered = mandatoryQuestions
      .filter((q: UiQuestion) => !state.responses[cq.id]?.[q.id])
      .map((q: UiQuestion) => q.id);

    setUnansweredQuestions(unanswered);
    return unanswered.length === 0;
  }, [questionnaires, state]);

  const handleQuestionResponse = (
    questionId: number,
    value: string | number | string[],
  ) => {
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
      setState((prev) => ({
        ...prev,
        currentQuestionnaireIndex: prev.currentQuestionnaireIndex + 1,
      }));
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (state.currentQuestionnaireIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentQuestionnaireIndex: prev.currentQuestionnaireIndex - 1,
      }));
      window.scrollTo(0, 0);
    }
  };

  const canSubmitOther = useMemo(() => {
    if (linkType !== "single_other") return true;
    if (!submittedBy) return false;
    if (submittedBy === "Altro" && !submittedByOther.trim()) return false;
    return true;
  }, [linkType, submittedBy, submittedByOther]);

  /**
   * ✅ SUBMIT (computed only)
   */
  const handleSubmit = async () => {
    if (!validateCurrentQuestionnaire()) return;

    // ✅ enforce "Submitted by" for OTHER links
    if (linkType === "single_other") {
      if (!submittedBy) {
        setError(
          "Please select who is submitting this questionnaire (Submitted by).",
        );
        return;
      }
      if (submittedBy === "Altro" && !submittedByOther.trim()) {
        setError('Please specify "Altro" (relationship) before submitting.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError("");

      if (!token) throw new Error("Missing token");
      if (!API_BASE) throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");

      const computedResults: Record<string, Record<string, any>> = {};

      for (const qn of questionnaires) {
        const formCode = (qn as any).formCode as string | undefined;
        if (!formCode)
          throw new Error("Missing formCode in questionnaire list");

        const mod: any = (QUESTIONNAIRE_REGISTRY as any)?.[formCode];
        if (!mod?.compute)
          throw new Error(`Compute not found for formCode="${formCode}"`);

        const uiResponsesForThis = state.responses[qn.id] || {};

        const answersForCompute: Record<string, any> = {};
        for (const q of qn.questions) {
          const key = (q as any).questionKey as string; // "q1"
          const raw = (uiResponsesForThis as any)?.[q.id];

          const strip = (v: any) =>
            typeof v === "string" ? v.split("__")[0] : v;

          if (Array.isArray(raw)) answersForCompute[key] = raw.map(strip);
          else answersForCompute[key] = strip(raw);
        }

        console.log(
          "✅ patientAge state:",
          patientAge,
          "type:",
          typeof patientAge,
        );
        console.log("✅ answersForCompute:", answersForCompute);

        const out = mod.compute(answersForCompute, {
          patientAge: patientAge ?? undefined,
          patientSex: patientSex ?? undefined,
          patientEducation: patientEducation ?? undefined,
        });
        console.log("✅ compute ctx:", {
          patientAge,
          patientSex,
          patientEducation,
        });
        computedResults[formCode] = out;
      }

      // ✅ set report_by based on OTHER selection
      const reportByValue: string | null =
        linkType === "single_other"
          ? submittedBy === "Altro"
            ? submittedByOther.trim()
            : submittedBy
          : null;

      const payload = {
        results: computedResults,
        report_by: reportByValue,
      };

      const url = `${API_BASE}/questionnaire/submit/${token}/`;

      // ✅ FRONTEND -> BACKEND কী যাচ্ছে (DevTools Console এ দেখাবে)
      console.log("✅ SUBMIT URL:", url);
      console.log("✅ SUBMIT token:", token);
      console.log("✅ SUBMIT payload object:", payload);
      console.log(
        "✅ SUBMIT payload JSON:\n",
        JSON.stringify(payload, null, 2),
      );

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
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

      localStorage.removeItem(`questionnaire_${token}`);
      alert("✅ Submitted successfully!");
      router.push("/questionnaire/success");
    } catch (err: any) {
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
              <AlertDescription>
                {error || "This link is invalid."}
              </AlertDescription>
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
              Questionnaire {state.currentQuestionnaireIndex + 1} of{" "}
              {questionnaires.length}
            </h1>

            {saveError && (
              <div className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded">
                Save error
              </div>
            )}
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
            <AlertDescription style={{ whiteSpace: "pre-wrap" }}>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* ✅ NEW: Submitted by block for OTHER type */}
        {linkType === "single_other" && (
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                Chi sta compilando questo questionario?
              </CardTitle>
              <CardDescription>
                Seleziona chi sta rispondendo per conto del paziente. (Required)
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <RadioGroup value={submittedBy} onValueChange={setSubmittedBy}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Madre",
                    "Padre",
                    "Fratello/Sorella",
                    "Coniuge/Partner",
                    "Amico/a",
                    "Altro",
                    "Tutore",
                    "Nonno/a",
                  ].map((opt) => (
                    <div
                      key={opt}
                      className="flex items-center gap-3 rounded border p-3"
                    >
                      <RadioGroupItem value={opt} id={`submittedby-${opt}`} />
                      <Label
                        htmlFor={`submittedby-${opt}`}
                        className="cursor-pointer font-medium"
                      >
                        {opt}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {submittedBy === "Altro" && (
                <div className="space-y-2">
                  <Label className="font-semibold">
                    Specificare (Required){" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    placeholder="Es: Zio, Cugino, Caregiver..."
                    value={submittedByOther}
                    onChange={(e) => setSubmittedByOther(e.target.value)}
                  />
                  {!submittedByOther.trim() && (
                    <p className="text-sm text-red-600">
                      Questo campo è obbligatorio.
                    </p>
                  )}
                </div>
              )}

              {!submittedBy && (
                <p className="text-sm text-red-600">
                  Seleziona chi sta compilando (required).
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle>{currentQuestionnaire.name}</CardTitle>
            <CardDescription>
              {currentQuestionnaire.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {currentQuestionnaire.questions.map(
              (question: UiQuestion, index: number) => {
                // ✅ INSTRUCTION type - render as heading only
                if (question.questionType === "instruction") {
                  return (
                    <div key={question.id} className="py-4">
                      <h3 className="text-lg font-bold text-gray-800 border-l-4 border-blue-600 pl-4">
                        {question.questionText}
                      </h3>
                    </div>
                  );
                }

                return (
                  <div
                    key={question.id}
                    className={`pb-6 border-b last:border-b-0 ${
                      unansweredQuestions.includes(question.id)
                        ? "bg-red-50 p-4 rounded"
                        : ""
                    }`}
                  >
                    <Label className="block text-base font-semibold text-gray-900 mb-3">
                      {index + 1}. {question.questionText}
                      {question.isMandatory && (
                        <span className="text-red-600 ml-1">*</span>
                      )}
                    </Label>

                    {/* SINGLE */}
                    {question.questionType === "single_choice" && (
                      <RadioGroup
                        value={String(
                          state.responses[currentQuestionnaire.id]?.[
                            question.id
                          ] ?? "",
                        )}
                        onValueChange={(value) =>
                          handleQuestionResponse(question.id, value)
                        }
                      >
                        <div className="space-y-2">
                          {question.options.map((option: UiOption) => (
                            <div
                              key={option.id}
                              className="flex items-center gap-3"
                            >
                              <RadioGroupItem
                                value={String(option.optionValue)}
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

                    {/* MULTIPLE */}
                    {question.questionType === "multiple_choice" && (
                      <div className="space-y-2">
                        {question.options.map((option: UiOption) => {
                          const currentValues =
                            (state.responses[currentQuestionnaire.id]?.[
                              question.id
                            ] as string[]) || [];
                          const val = String(option.optionValue);
                          const checked = currentValues.includes(val);

                          return (
                            <div
                              key={option.id}
                              className="flex items-center gap-3"
                            >
                              <Checkbox
                                id={`option-${question.id}-${option.id}`}
                                checked={checked}
                                onCheckedChange={(c) => {
                                  const newValues = c
                                    ? Array.from(
                                        new Set([...currentValues, val]),
                                      )
                                    : currentValues.filter((v) => v !== val);
                                  handleQuestionResponse(
                                    question.id,
                                    newValues,
                                  );
                                }}
                              />
                              <Label
                                htmlFor={`option-${question.id}-${option.id}`}
                                className="font-normal cursor-pointer"
                              >
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
                        value={String(
                          state.responses[currentQuestionnaire.id]?.[
                            question.id
                          ] ?? "",
                        )}
                        onChange={(e) =>
                          handleQuestionResponse(question.id, e.target.value)
                        }
                        className="mt-2"
                      />
                    )}

                    {unansweredQuestions.includes(question.id) && (
                      <p className="text-sm text-red-600 mt-2">
                        Please answer this question.
                      </p>
                    )}
                  </div>
                );
              },
            )}
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
              onClick={handleSubmit}
              disabled={isSubmitting || isSaving || !canSubmitOther}
              className="flex-1 gap-2"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={unansweredQuestions.length > 0}
              className="flex-1 gap-2"
            >
              Next
              <ChevronRight size={20} />
            </Button>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isSaving && "Saving..."}
          {!isSaving &&
            lastSavedAt &&
            `Last saved: ${lastSavedAt.toLocaleTimeString("en-US")}`}
        </div>
      </div>
    </main>
  );
}
