'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchPatients, setSelectedPatientId } from '@/src/store/slices/patientsSlice';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Plus, Copy, Mail, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

import { QUESTIONNAIRE_REGISTRY } from '@/lib/questionnaires'; // ✅ use src path
import type { Patient, Questionnaire } from '@/src/types';

interface GeneratedLink {
  type: 'all_self' | 'single_other';
  url: string;
  questionnaireName: string;
  expiresAt: string;
}

export default function QuestionnairesPage() {
  const router = useRouter();

  // ---------- Redux patients ----------
  const dispatch = useAppDispatch();
  const { list: patientList, isLoading: isPatientsLoading, selectedPatientId } =
    useAppSelector((s) => s.patients);

  useEffect(() => {
    if (!patientList.length) dispatch(fetchPatients());
  }, [dispatch, patientList.length]);

  // ---------- Local questionnaires ----------
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<number[]>([]);
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([]);
  const [error, setError] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<string>('');
  const [qLoading, setQLoading] = useState(true);
  const [qSearch, setQSearch] = useState('');

  useEffect(() => {
    try {
      setQLoading(true);
      setError('');

      // ✅ registry is Record -> use values
      const modules = Object.values(QUESTIONNAIRE_REGISTRY);

      const list: Questionnaire[] = modules.map((m, idx) => ({
        id: idx + 1,
        code: m.def.formCode,              // ✅ details route uses this
        name: m.def.name,
        description: m.def.instruction,
        type: m.def.type,                  // SELF / OTHER
        category: m.def.code,              // group
        questionCount: m.def.questions.length,
        createdAt: '2024-01-01',
      }));

      setQuestionnaires(list);
    } catch (err: any) {
      setError(err?.message || 'Failed to load questionnaires');
    } finally {
      setQLoading(false);
    }
  }, []);

  const filteredQuestionnaires = useMemo(() => {
    const t = qSearch.trim().toLowerCase();
    if (!t) return questionnaires;

    return questionnaires.filter((q) =>
      `${q.name} ${q.description || ''} ${q.type || ''} ${q.code || ''} ${q.category || ''}`
        .toLowerCase()
        .includes(t),
    );
  }, [qSearch, questionnaires]);

  const handleDeleteQuestionnaire = (id: number) => {
    if (!confirm('Delete this questionnaire?')) return;
    setQuestionnaires((prev) => prev.filter((x) => x.id !== id));
    setSelectedQuestionnaires((prev) => prev.filter((qid) => qid !== id));
  };

  const handleSelectQuestionnaire = (questionnaireId: number) => {
    setSelectedQuestionnaires((prev) =>
      prev.includes(questionnaireId)
        ? prev.filter((id) => id !== questionnaireId)
        : [...prev, questionnaireId],
    );
  };

  const handleAssignQuestionnaires = async () => {
    setError('');

    if (!selectedPatientId || selectedQuestionnaires.length === 0) {
      setError('Please select a patient and at least one questionnaire');
      return;
    }

    try {
      const selfQuestionnaires = questionnaires.filter(
        (q) => selectedQuestionnaires.includes(q.id) && q.type === 'SELF',
      );
      const otherQuestionnaires = questionnaires.filter(
        (q) => selectedQuestionnaires.includes(q.id) && q.type === 'OTHER',
      );

      const links: GeneratedLink[] = [];

      if (selfQuestionnaires.length > 0) {
        const token = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
        links.push({
          type: 'all_self',
          url: `${window.location.origin}/questionnaire/${token}`,
          questionnaireName: `${selfQuestionnaires.length} SELF questionnaires`,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT'),
        });
      }

      otherQuestionnaires.forEach((q) => {
        const token = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
        links.push({
          type: 'single_other',
          url: `${window.location.origin}/questionnaire/${token}`,
          questionnaireName: q.name,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT'),
        });
      });

      setGeneratedLinks(links);
    } catch (err: any) {
      setError(err?.message || 'Failed to assign questionnaires');
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(url);
      setTimeout(() => setCopiedLink(''), 2000);
    } catch {}
  };

  const selectedPatientName =
    patientList.find((p: Patient) => p.id.toString() === selectedPatientId)?.name || '';

  if (qLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading questionnaires...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questionnaires</h1>
          <p className="text-gray-600 mt-1">Manage and assign assessments</p>
        </div>

        {/* <Link href="/admin/dashboard/questionnaires/add">
          <Button className="gap-2">
            <Plus size={20} />
            New Questionnaire
          </Button>
        </Link> */}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Assignment Section */}
      {generatedLinks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Assign Questionnaires to Patient</CardTitle>
            <CardDescription>Select a patient and choose which questionnaires to assign</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Patient Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Select Patient</label>

              <Select
                value={selectedPatientId}
                onValueChange={(v) => dispatch(setSelectedPatientId(v))}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={isPatientsLoading ? 'Loading...' : 'Choose a patient...'}
                  />
                </SelectTrigger>

                <SelectContent>
                  {patientList.map((patient: Patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Questionnaires Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Select Questionnaires ({selectedQuestionnaires.length} selected)
              </label>

              <Input
                placeholder="Search questionnaires..."
                value={qSearch}
                onChange={(e) => setQSearch(e.target.value)}
              />

              <div className="border rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
                {filteredQuestionnaires.length === 0 ? (
                  <p className="text-sm text-gray-600">No questionnaires found.</p>
                ) : (
                  filteredQuestionnaires.map((q) => (
                    <div key={q.id} className="flex items-start gap-3">
                      <Checkbox
                        id={`q-${q.id}`}
                        checked={selectedQuestionnaires.includes(q.id)}
                        onCheckedChange={() => handleSelectQuestionnaire(q.id)}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`q-${q.id}`}
                          className="font-medium text-gray-900 cursor-pointer block"
                        >
                          {q.name}
                        </label>
                        <p className="text-sm text-gray-600 mt-1">{q.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {q.type}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {q.questionCount} questions
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button
              onClick={handleAssignQuestionnaires}
              className="w-full"
              disabled={!selectedPatientId || selectedQuestionnaires.length === 0}
            >
              <CheckCircle className="mr-2" size={20} />
              Generate Links & Assign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle size={24} />
              Questionnaires Assigned Successfully
            </CardTitle>
            <CardDescription>Generated secure links for {selectedPatientName}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {generatedLinks.map((link, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{link.questionnaireName}</p>
                    <p className="text-sm text-gray-600">Expires: {link.expiresAt}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {link.type === 'all_self' ? 'Self-Report' : 'Informant'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Input value={link.url} readOnly className="text-sm font-mono" />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(link.url)}
                    className="gap-1"
                  >
                    <Copy size={16} />
                    {copiedLink === link.url ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <Mail size={16} />
                    Send Email
                  </Button>
                  <Button variant="ghost" size="sm">
                    Preview
                  </Button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                setGeneratedLinks([]);
                setSelectedQuestionnaires([]);
                dispatch(setSelectedPatientId(''));
              }}
            >
              Assign More Questionnaires
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Questionnaires Table */}
      <Card>
        <CardHeader>
          <CardTitle>Available Questionnaires</CardTitle>
          <CardDescription>Complete list of diagnostic assessments</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Questions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredQuestionnaires.map((q) => (
                  <TableRow
                    key={q.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/admin/dashboard/questionnaires/${q.code}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(`/admin/dashboard/questionnaires/${q.code}`);
                      }
                    }}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{q.name}</span>
                        {q.description ? (
                          <span className="text-xs text-gray-500 line-clamp-1">
                            {q.description}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          q.type === 'SELF'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {q.type}
                      </span>
                    </TableCell>

                    <TableCell className="text-gray-700">{q.category}</TableCell>
                    <TableCell className="text-gray-700">{q.questionCount}</TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
