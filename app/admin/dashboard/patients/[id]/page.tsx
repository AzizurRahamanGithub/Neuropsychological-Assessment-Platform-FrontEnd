'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { FileText, ArrowLeft, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchPatientDetail, clearPatientDetail } from '@/src/store/slices/patientDetailSlice';

// ✅ Import export function
import { exportAssignmentToDocx } from '@/src/lib/export-docx';

/** -------- Types (match backend grouped response) -------- */
type LinkType = 'all_self' | 'single_other';

type ApiLink = {
  link_id: number;
  assignment_id: number;
  link_type: LinkType;
  token: string;
  url: string | null;
  questionnaires: string[];
  report_by: string | null;
  is_submitted: boolean;
  submitted_at: string | null;
  results: Record<string, Record<string, any>> | null;
  created_at: string;
};

type ApiAssignmentGroup = {
  assignment_id: number;
  created_at: string;
  is_completed?: boolean;
  links: ApiLink[];
  counts?: {
    total: number;
    submitted: number;
    pending: number;
  };
};

type ApiPatientStats = {
  assignments_count: number;
  assignments_completed: number;
  by_type?: {
    all_self: number;
    single_other: number;
  };
};

type ApiPatientDetail = {
  id: number;
  name: string | null;
  surname: string | null;
  sex: string | null;
  birth: string | null;
  education: number | null;
  handedness: string | null;
  created_at: string;
  updated_at: string;
  stats?: ApiPatientStats;
  assignments?: ApiAssignmentGroup[];
};

const sexUi = (s?: string | null) => {
  const v = String(s || '').toLowerCase();
  if (v === 'male' || v === 'm') return 'M';
  if (v === 'female' || v === 'f') return 'F';
  return v ? 'O' : '–';
};

const handednessUi = (h?: string | null) => {
  const s = String(h || '').toLowerCase();
  if (s === 'left' || s === 'sx') return 'sx';
  if (s === 'right' || s === 'dx') return 'dx';
  return '—';
};

const calcAge = (birthIso?: string | null) => {
  if (!birthIso) return '—';
  const d = new Date(birthIso);
  if (isNaN(d.getTime())) return '—';
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return String(age);
};

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const patientIdStr = params.id as string;
  const patientId = Number(patientIdStr);

  const { data, isLoading, error } = useAppSelector((s) => s.patientDetail);

  const [copiedLink, setCopiedLink] = useState<number | null>(null);
  const [exportingAssignment, setExportingAssignment] = useState<number | null>(null);

  useEffect(() => {
    if (!patientId || Number.isNaN(patientId)) return;

    dispatch(fetchPatientDetail(patientId));

    return () => {
      dispatch(clearPatientDetail());
    };
  }, [dispatch, patientId]);

  const patient = (data as unknown as ApiPatientDetail | null) ?? null;

  const computed = useMemo(() => {
    const groups = patient?.assignments || [];
    const stats = patient?.stats;

    const assignmentsCount = stats?.assignments_count ?? groups.length;
    const assignmentsCompleted = stats?.assignments_completed ?? 0;

    const selfLinks = stats?.by_type?.all_self ?? 0;
    const otherLinks = stats?.by_type?.single_other ?? 0;

    return {
      assignmentsCount,
      assignmentsCompleted,
      selfLinks,
      otherLinks,
      groups,
    };
  }, [patient]);

  const copyToClipboard = async (text: string, rowId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(rowId);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch {
      // ignore
    }
  };

  // ✅ Handle Word export
  const handleExportWord = async (assignment: ApiAssignmentGroup) => {
    if (!patient) return;

    // Check if completed
    const totalLinks = assignment.links?.length || 0;
    const submittedLinks = assignment.links?.filter((x) => x.is_submitted).length || 0;
    const isCompleted = totalLinks > 0 && submittedLinks === totalLinks;

    if (!isCompleted) {
      alert('Assignment is not completed yet. Please complete all links before exporting.');
      return;
    }

    try {
      setExportingAssignment(assignment.assignment_id);

      const patientInfo = {
        name: patient.name || '',
        surname: patient.surname || '',
        education: patient.education,
        age: calcAge(patient.birth),
        sex: sexUi(patient.sex),
        handedness: handednessUi(patient.handedness),
      };

      await exportAssignmentToDocx(patientInfo, assignment);

      // Success feedback
      setTimeout(() => {
        setExportingAssignment(null);
      }, 1000);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export document. Please try again.');
      setExportingAssignment(null);
    }
  };

  const getStatusBadge = (completed: boolean) => {
    if (completed) {
      return (
        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
          <CheckCircle size={16} />
          Completed
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
        <Clock size={16} />
        In Progress
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
            {patient.name || '–'} {patient.surname || ''}
          </h1>
          <p className="text-gray-600 mt-1">Patient ID: {patient.id}</p>
        </div>
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
              <p className="text-lg font-semibold text-gray-900">{sexUi(patient.sex)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="text-lg font-semibold text-gray-900">
                {patient.birth ? new Date(patient.birth).toLocaleDateString('it-IT') : '–'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Years of Education</p>
              <p className="text-lg font-semibold text-gray-900">
                {patient.education != null ? `${patient.education} years` : '–'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Registered</p>
              <p className="text-lg font-semibold text-gray-900">
                {patient.created_at ? new Date(patient.created_at).toLocaleDateString('it-IT') : '–'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{computed.assignmentsCount}</p>
              <p className="text-sm text-gray-600 mt-1">Assignments</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{computed.assignmentsCompleted}</p>
              <p className="text-sm text-gray-600 mt-1">Assignments Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{computed.selfLinks}</p>
              <p className="text-sm text-gray-600 mt-1">Self Links</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">{computed.otherLinks}</p>
              <p className="text-sm text-gray-600 mt-1">Other Links</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Questionnaires */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Questionnaires</CardTitle>
          <CardDescription>Assignments grouped by each assign action</CardDescription>
        </CardHeader>

        <CardContent>
          {computed.groups.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No questionnaires assigned yet</div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Assignment</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Assigned</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {computed.groups.map((g) => {
                    const totalLinks = g.links?.length || 0;
                    const submittedLinks = g.links?.filter((x) => x.is_submitted).length || 0;
                    const groupCompleted = totalLinks > 0 && submittedLinks === totalLinks;

                    const label = `Assignment #${g.assignment_id} — ${totalLinks} link(s) (${submittedLinks} completed)`;

                    const isExporting = exportingAssignment === g.assignment_id;

                    return (
                      <TableRow
                        key={g.assignment_id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          const selfLink = g.links?.find((l) => l.link_type === 'all_self');
                          const firstLink = g.links?.[0];

                          const targetLinkId = selfLink?.link_id ?? firstLink?.link_id;

                          if (!targetLinkId) return;

                          router.push(`/admin/dashboard/patients/${patient.id}/assignments/${targetLinkId}`);
                        }}
                      >
                        <TableCell className="font-medium">{label}</TableCell>

                        <TableCell>{getStatusBadge(groupCompleted)}</TableCell>

                        <TableCell className="text-sm text-gray-600">
                          {g.created_at ? new Date(g.created_at).toLocaleDateString('it-IT') : '–'}
                        </TableCell>

                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleExportWord(g)}
                            disabled={isExporting || !groupCompleted}
                          >
                            {isExporting ? (
                              <>
                                <Download size={16} className="animate-bounce" />
                                Exporting...
                              </>
                            ) : (
                              <>
                                <FileText size={16} />
                                Word
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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