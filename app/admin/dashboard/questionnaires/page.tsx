'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  Copy,
  Mail,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import type { Questionnaire, QuestionnaireLink } from '@/types';

interface PatientWithAssignments {
  id: number;
  name: string;
  surname: string;
  assignmentCount: number;
}

interface GeneratedLink {
  type: 'all_self' | 'single_other';
  url: string;
  questionnaireName: string;
  expiresAt: string;
}

export default function QuestionnairesPage() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<number[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [patients, setPatients] = useState<PatientWithAssignments[]>([]);
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<string>('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Mock questionnaires data
      const mockQuestionnaires: Questionnaire[] = [
        {
          id: 1,
          code: 'BAARS_IV',
          name: 'Barkley Adult ADHD Rating Scale-IV',
          description: 'Comprehensive ADHD assessment for adults',
          type: 'SELF',
          category: 'ADHD Assessment',
          questionCount: 27,
          version: 'IV',
          createdAt: '2024-01-01',
        },
        {
          id: 2,
          code: 'CONNERS_ADHD',
          name: 'Conners ADHD Rating Scale',
          description: 'ADHD symptoms assessment',
          type: 'SELF',
          category: 'ADHD Assessment',
          questionCount: 30,
          version: 'v3',
          createdAt: '2024-01-01',
        },
        {
          id: 3,
          code: 'SNAP_IV',
          name: 'Swanson, Nolan, and Pelham Rating Scale',
          description: 'Parent and teacher rating scale',
          type: 'OTHER',
          category: 'ADHD Assessment',
          questionCount: 26,
          version: 'IV',
          createdAt: '2024-01-01',
        },
        {
          id: 4,
          code: 'CANTAB',
          name: 'Cambridge Neuropsychological Test Automated Battery',
          description: 'Cognitive assessment battery',
          type: 'SELF',
          category: 'Neuropsychological',
          questionCount: 45,
          version: '6.0',
          createdAt: '2024-01-01',
        },
        {
          id: 5,
          code: 'MOXO',
          name: 'Monotask and Dual-Task Performance Test',
          description: 'Continuous attention and impulsivity',
          type: 'SELF',
          category: 'Attention',
          questionCount: 15,
          version: '2.0',
          createdAt: '2024-01-01',
        },
      ];

      // Mock patients data
      const mockPatients: PatientWithAssignments[] = [
        { id: 1, name: 'Giovanni', surname: 'Rossi', assignmentCount: 2 },
        { id: 2, name: 'Maria', surname: 'Bianchi', assignmentCount: 1 },
        { id: 3, name: 'Paolo', surname: 'Verdi', assignmentCount: 0 },
        { id: 4, name: 'Laura', surname: 'Rizzo', assignmentCount: 3 },
      ];

      setQuestionnaires(mockQuestionnaires);
      setPatients(mockPatients);
    } catch (err: any) {
      setError(err?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuestionnaire = (questionnaireId: number) => {
    setSelectedQuestionnaires((prev) =>
      prev.includes(questionnaireId)
        ? prev.filter((id) => id !== questionnaireId)
        : [...prev, questionnaireId],
    );
  };

  const handleAssignQuestionnaires = async () => {
    if (!selectedPatient || selectedQuestionnaires.length === 0) {
      setError('Please select a patient and at least one questionnaire');
      return;
    }

    try {
      // Generate mock links
      const selfQuestionnaires = questionnaires.filter(
        (q) => selectedQuestionnaires.includes(q.id) && q.type === 'SELF',
      );
      const otherQuestionnaires = questionnaires.filter(
        (q) => selectedQuestionnaires.includes(q.id) && q.type === 'OTHER',
      );

      const links: GeneratedLink[] = [];

      if (selfQuestionnaires.length > 0) {
        const token = Math.random().toString(36).substring(2, 15);
        links.push({
          type: 'all_self',
          url: `${window.location.origin}/questionnaire/${token}`,
          questionnaireName: `${selfQuestionnaires.length} SELF questionnaires`,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT'),
        });
      }

      otherQuestionnaires.forEach((q) => {
        const token = Math.random().toString(36).substring(2, 15);
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
    } catch {
      console.error('Failed to copy');
    }
  };

  if (isLoading) {
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
        <Link href="/admin/dashboard/questionnaires/add">
          <Button className="gap-2">
            <Plus size={20} />
            New Questionnaire
          </Button>
        </Link>
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
            <CardDescription>
              Select a patient and choose which questionnaires to assign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Patient
              </label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name} {patient.surname}{' '}
                      <span className="text-xs text-gray-500">
                        ({patient.assignmentCount} assigned)
                      </span>
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
              <div className="border rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
                {questionnaires.map((q) => (
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
                ))}
              </div>
            </div>

            <Button
              onClick={handleAssignQuestionnaires}
              className="w-full"
              disabled={!selectedPatient || selectedQuestionnaires.length === 0}
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
            <CardDescription>
              Generated secure links for{' '}
              {patients.find((p) => p.id.toString() === selectedPatient)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedLinks.map((link, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{link.questionnaireName}</p>
                    <p className="text-sm text-gray-600">
                      Expires: {link.expiresAt}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {link.type === 'all_self' ? 'Self-Report' : 'Informant'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={link.url}
                    readOnly
                    className="text-sm font-mono"
                  />
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 bg-transparent"
                  >
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
                setSelectedPatient('');
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
          <CardDescription>
            Complete list of diagnostic assessments
          </CardDescription>
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
                  <TableHead className="font-semibold">Version</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionnaires.map((q) => (
                  <TableRow key={q.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{q.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-sm ${
                        q.type === 'SELF'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {q.type}
                      </span>
                    </TableCell>
                    <TableCell>{q.category}</TableCell>
                    <TableCell>{q.questionCount}</TableCell>
                    <TableCell>{q.version}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
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
