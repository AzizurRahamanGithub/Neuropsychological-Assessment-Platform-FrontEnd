'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuestionnaireRenderer from "@/components/ui/questionnaireRenderer";
import { BAARS_IV_ATTUALE_SELF, computeBAARSIVSelf } from "@/lib/questionnaires/BAARS-IV-attuale-self/questionnaires";

export default function BaarsIvSelfPage() {
  const def = BAARS_IV_ATTUALE_SELF;

  const onSubmit = (answers: Record<string, any>) => {
    // ✅ compute lives inside questionnaire file
    const computed = computeBAARSIVSelf(answers);

    // ✅ now you decide where to show:
    // 1) console/log
    console.log("computed", computed);

    // 2) or localStorage
    localStorage.setItem(`computed_${def.formCode}`, JSON.stringify(computed));

    // 3) later: send to backend
    // fetch("/api/submit", {method:"POST", body: JSON.stringify(...)})
    alert("Submitted! Check console/localStorage.");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>{def.name}</CardTitle>
            <p className="text-sm text-gray-600">{def.instruction}</p>
          </CardHeader>

          <CardContent>
            <QuestionnaireRenderer def={def} onSubmit={onSubmit} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
