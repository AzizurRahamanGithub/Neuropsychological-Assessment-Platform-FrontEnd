'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getQuestionnaireByCode } from '@/lib/questionnaires';

export default function QuestionnaireDetailsPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;

  const q = useMemo(() => getQuestionnaireByCode(code), [code]);

  const [respondent, setRespondent] = useState<string>('');

  if (!q) {
    return (
      <div className="space-y-4">
        <p className="text-gray-700">Questionnaire not found.</p>
        <Link href="/admin/dashboard/questionnaires">
          <Button variant="outline">Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{q.name}</h1>
          <p className="text-gray-600 mt-1">{q.description}</p>
        </div>
        <Link href="/admin/dashboard/questionnaires">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Code: {q.code} • Type: {q.type} </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {q.type === 'OTHER' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Who will fill this questionnaire?
              </label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={respondent}
                onChange={(e) => setRespondent(e.target.value)}
              >
                <option value="">Select respondent...</option>
                {(q.respondents || []).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                (For OTHER type questionnaires, select the informant: mom/dad/cousin/teacher etc.)
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">
              Questions ({q.questions.length})
            </h2>

            <div className="space-y-4">
              {q.questions.map((qq, idx) => (
                <div key={qq.id} className="border rounded-lg p-4">
                  <p className="font-medium text-gray-900">
                    {idx + 1}. {qq.text}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {qq.options.map(op => (
                      <label key={op.value} className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="radio" name={qq.id} value={op.value} />
                        {op.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full" disabled={q.type === 'OTHER' && !respondent}>
            Save (mock)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
