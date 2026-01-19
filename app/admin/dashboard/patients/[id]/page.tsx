'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Copy } from 'lucide-react';
import type { PatientDetail, QuestionnaireAssignment } from '@/types';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<number | null>(null);

  useEffect(() => {
    loadPatientDetail();
  }, [patientId]);

  const loadPatientDetail = async () => {
    try {
      setIsLoading(true);
      
      // Mock data - replace with actual API call
      const mockPatient: PatientDetail = {
        id: 1,
        userId: 1,
        name: 'Giovanni',
        surname: 'Rossi',
        sex: 'M',
        dateOfBirth: '1990-05-15',
        yearsOfEducation: 13,
        clinicianId: 1,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10',
        assignments: [
          {
            id: 1,
            patientId: 1,
            questionnaireId: 1,
            assignedBy: 1,
            assignedAt: '2024-01-15',
            completedAt: '2024-01-18',
            completionPercentage: 100,
            isCompleted: true,
            questionnaire: {
              id: 1,
              code: 'BAARS_IV',
              name: 'Barkley Adult ADHD Rating Scale-IV',
              description: 'Comprehensive ADHD assessment',
              type: 'SELF',
              category: 'ADHD Assessment',
              questionCount: 27,
              version: 'IV',
              createdAt: '2024-01-01',
            },
          },
          {
            id: 2,
            patientId: 1,
            questionnaireId: 2,
            assignedBy: 1,
            assignedAt: '2024-01-15',
            completedAt: null,
            completionPercentage: 45,
            isCompleted: false,
            questionnaire: {
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
          },
        ],
        completionSummary: {
          totalAssigned: 2,
          completed: 1,
          inProgress: 1,
          pending: 0,
        },
      };

      setPatient(mockPatient);
    } catch (err: any) {
      setError(err?.message || 'Failed to load patient');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, assignmentId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(assignmentId);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  const getStatusBadge = (assignment: QuestionnaireAssignment) => {
    if (assignment.isCompleted) {
      return (
        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
          <CheckCircle size={16} />
          Completed
        </div>
      );
    }
    if (assignment.completionPercentage > 0) {
      return (
        <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
          <Clock size={16} />
          {assignment.completionPercentage}% In Progress
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
        <AlertCircle size={16} />
        Pending
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading patient details...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard/patients">
            <Button variant="outline" size="sm">
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Patient not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/dashboard/patients">
              <Button variant="outline" size="sm">
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {patient.name} {patient.surname}
          </h1>
          <p className="text-gray-600 mt-1">Patient ID: {patient.id}</p>
        </div>
        <Link href={`/admin/dashboard/patients/${patient.id}/edit`}>
          <Button>Edit Patient</Button>
        </Link>
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Sex</p>
              <p className="text-lg font-semibold text-gray-900">{patient.sex || '–'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="text-lg font-semibold text-gray-900">
                {patient.dateOfBirth
                  ? new Date(patient.dateOfBirth).toLocaleDateString('it-IT')
                  : '–'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Years of Education</p>
              <p className="text-lg font-semibold text-gray-900">
                {patient.yearsOfEducation ? `${patient.yearsOfEducation} years` : '–'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Registered</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(patient.createdAt).toLocaleDateString('it-IT')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {patient.completionSummary.totalAssigned}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Assigned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {patient.completionSummary.completed}
              </p>
              <p className="text-sm text-gray-600 mt-1">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {patient.completionSummary.inProgress}
              </p>
              <p className="text-sm text-gray-600 mt-1">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">
                {patient.completionSummary.pending}
              </p>
              <p className="text-sm text-gray-600 mt-1">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Questionnaires */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Questionnaires</CardTitle>
          <CardDescription>
            List of questionnaires assigned to this patient
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patient.assignments.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No questionnaires assigned yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Questionnaire</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Progress</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Assigned</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.assignments.map((assignment) => (
                    <TableRow key={assignment.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {assignment.questionnaire.name}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                          {assignment.questionnaire.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${assignment.completionPercentage}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {assignment.completionPercentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(assignment)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(assignment.assignedAt).toLocaleDateString('it-IT')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => copyToClipboard(
                            `${window.location.origin}/questionnaire/${assignment.id}`,
                            assignment.id,
                          )}
                        >
                          <Copy size={16} />
                          {copiedLink === assignment.id ? 'Copied!' : 'Copy Link'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="mt-6">
            <Link href={`/admin/dashboard/questionnaires?patient_id=${patient.id}`}>
              <Button>Assign Questionnaires</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
