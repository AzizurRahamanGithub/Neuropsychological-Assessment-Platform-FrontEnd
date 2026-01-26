'use client';

import Link from "next/link";
import { QUESTIONNAIRE_REGISTRY } from "@/lib/questionnaires";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function QuestionnaireHome() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Questionnaires</h1>

      <div className="grid gap-3">
        {QUESTIONNAIRE_REGISTRY.map(({ def }) => (
          <Link key={def.formCode} href={`/questionnaire/${def.formCode.toLowerCase().replaceAll("_", "-")}`}>
            <Card className="cursor-pointer hover:bg-gray-50">
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>{def.name}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{def.type}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                {def.instruction}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
