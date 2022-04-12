'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { QuestionnaireDef } from "@/lib/questionnaires/types";

type Props = {
  def: QuestionnaireDef;
  onSubmit: (answers: Record<string, any>) => void;
};

export default function QuestionnaireRenderer({ def, onSubmit }: Props) {
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const setAnswer = (key: string, value: any) => {
    setAnswers((p) => ({ ...p, [key]: value }));
  };

  const submit = () => {
    // required validation (simple)
    const missing = def.questions
      .filter((q) => q.required)
      .filter((q) => {
        const v = answers[q.key];
        return v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
      });

    if (missing.length) {
      alert(`Please answer required questions: ${missing.map((m) => m.number).join(", ")}`);
      return;
    }

    onSubmit(answers);
  };

  return (
    <div className="space-y-6">
      {def.questions.map((q) => (
        <div key={q.key} className="space-y-2 border-b pb-4">
          <Label className="font-semibold">
            {q.number}. {q.text} {q.required ? <span className="text-red-600">*</span> : null}
          </Label>

          {q.type === "single_choice" && (
            <RadioGroup value={answers[q.key] || ""} onValueChange={(v) => setAnswer(q.key, v)}>
              {q.options?.map((op, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <RadioGroupItem id={`${q.key}-${idx}`} value={op.label} />
                  <Label htmlFor={`${q.key}-${idx}`}>{op.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {q.type === "multiple_choice" && (
            <div className="space-y-2">
              {q.options?.map((op, idx) => {
                const cur: string[] = Array.isArray(answers[q.key]) ? answers[q.key] : [];
                const checked = cur.includes(op.label);
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => {
                        const next = c ? [...cur, op.label] : cur.filter((x) => x !== op.label);
                        setAnswer(q.key, next);
                      }}
                    />
                    <Label>{op.label}</Label>
                  </div>
                );
              })}
            </div>
          )}

          {q.type === "text" && (
            <Input value={answers[q.key] || ""} onChange={(e) => setAnswer(q.key, e.target.value)} />
          )}
        </div>
      ))}

      <Button className="w-full" onClick={submit}>
        Submit
      </Button>
    </div>
  );
}
