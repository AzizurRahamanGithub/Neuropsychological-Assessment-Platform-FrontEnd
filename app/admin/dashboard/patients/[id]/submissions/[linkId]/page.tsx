'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { ArrowLeft, AlertCircle, CheckCircle, Clock, Copy, ExternalLink } from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

type Submission = {
  link_id: number;
  assignment_id: number;
  link_type: 'all_self' | 'single_other';
  token: string;
  url: string | null;
  questionnaires: string[];
  report_by: string | null;
  is_submitted: boolean;
  submitted_at: string | null;
  created_at: string;
  results: Record<string, Record<string, any>> | null; // computed only
};

type AssignmentGroup = {
  assignment_id: number;
  created_at: string;
  is_completed?: boolean;
  links: Submission[];
};

type PatientDetail = {
  id: number;
  name: string | null;
  surname: string | null;

  sex?: 'male' | 'female' | string;
  birth?: string | null;
  education?: number | null;
  handedness?: 'left' | 'right' | string;

  created_at?: string;

  assignments: AssignmentGroup[];
};

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function calcAge(birthIso?: string | null) {
  if (!birthIso) return '—';
  const d = new Date(birthIso);
  if (isNaN(d.getTime())) return '—';
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return String(age);
}

function sexUi(sex?: string) {
  if (!sex) return '—';
  const s = sex.toLowerCase();
  if (s === 'male' || s === 'm') return 'M';
  if (s === 'female' || s === 'f') return 'F';
  return 'O';
}

function handednessUi(h?: string) {
  if (!h) return '—';
  const s = h.toLowerCase();
  if (s === 'left' || s === 'sx') return 'sx';
  if (s === 'right' || s === 'dx') return 'dx';
  return '—';
}

function groupResultRows(resultDict: Record<string, any>) {
  const groups: Record<string, { label: string; value: any }[]> = {};

  for (const [k, v] of Object.entries(resultDict || {})) {
    const parts = k.split(' ');
    if (parts.length >= 2) {
      const group = parts.slice(0, -1).join(' ').trim();
      const label = parts.slice(-1)[0].trim();
      if (!groups[group]) groups[group] = [];
      groups[group].push({ label, value: v });
    } else {
      if (!groups['Altro']) groups['Altro'] = [];
      groups['Altro'].push({ label: k, value: v });
    }
  }

  const priority = (x: string) =>
    x.toLowerCase().includes('punteggio') ? 0 : x.includes('n°') ? 1 : 2;

  return Object.entries(groups).map(([group, items]) => ({
    group,
    items: items.sort((a, b) => priority(a.label) - priority(b.label)),
  }));
}

function StatusBadge({ submitted }: { submitted: boolean }) {
  if (submitted) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
        <CheckCircle size={14} /> Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
      <Clock size={14} /> In progress
    </span>
  );
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const patientId = params.id as string;
  const linkId = Number(params.linkId as string);

  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        if (!API_BASE) throw new Error('Missing NEXT_PUBLIC_API_BASE_URL');

        const accessToken = localStorage.getItem('accessToken');
        const url = `${API_BASE}/patients/patient/${patientId}/`;

        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          cache: 'no-store',
        });

        const json = await safeJson(res);

        if (!res.ok || json?.success === false) {
          throw new Error(json?.message || json?.detail || JSON.stringify(json?.error || json));
        }

        setPatient(json.data as PatientDetail);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [patientId]);

  const { submission, assignment } = useMemo(() => {
    if (!patient) return { submission: null as Submission | null, assignment: null as AssignmentGroup | null };

    for (const a of patient.assignments || []) {
      const found = a.links?.find((l) => l.link_id === linkId);
      if (found) return { submission: found, assignment: a };
    }
    return { submission: null, assignment: null };
  }, [patient, linkId]);

  const assignmentLinks = useMemo(() => {
    if (!assignment) return [];
    // show self first, then other; newest last/first your choice
    const links = [...(assignment.links || [])];
    links.sort((a, b) => {
      const wA = a.link_type === 'all_self' ? 0 : 1;
      const wB = b.link_type === 'all_self' ? 0 : 1;
      if (wA !== wB) return wA - wB;
      return (a.link_id || 0) - (b.link_id || 0);
    });
    return links;
  }, [assignment]);

  const reportDate = assignment?.created_at
    ? new Date(assignment.created_at).toLocaleDateString('it-IT')
    : submission?.created_at
      ? new Date(submission.created_at).toLocaleDateString('it-IT')
      : 'xx.xx.xxxx';

  const headerInfo = useMemo(() => {
    if (!patient) return null;
    return {
      education: patient.education ?? '—',
      age: calcAge(patient.birth ?? null),
      sex: sexUi(patient.sex),
      handedness: handednessUi(patient.handedness),
    };
  }, [patient]);

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

  if (loading) return <div className="text-gray-600">Loading...</div>;

  if (!patient || !submission || !assignment || !headerInfo) {
    return (
      <div className="space-y-4">
        <Link href={`/admin/dashboard/patients/${patientId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        </Link>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Submission not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const resultsObj = submission.results || {};
  const isOther = submission.link_type === 'single_other';
  const reporterName = isOther ? (submission.report_by || '—') : null;

  return (
    <div className="space-y-6">
      <Link href={`/admin/dashboard/patients/${patientId}`}>
        <Button variant="outline" size="sm">
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>
            {patient.name} {patient.surname} — Assignment #{assignment.assignment_id} — Link #{submission.link_id}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-1">
          <div>
            Type: {submission.link_type === 'all_self' ? 'SELF Bundle' : 'OTHER'}{' '}
            <span className="ml-2">
              <StatusBadge submitted={!!submission.is_submitted} />
            </span>
          </div>

          {isOther ? (
            <div>
              Report by: <span className="font-semibold text-gray-800">{reporterName}</span>
            </div>
          ) : null}

          {submission.submitted_at ? (
            <div>Submitted At: {new Date(submission.submitted_at).toLocaleString('it-IT')}</div>
          ) : null}
        </CardContent>
      </Card>

      {/* ✅ Assignment links list (show all links at the top) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assignment Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {assignmentLinks.length === 0 ? (
            <div className="text-sm text-gray-600">No links found in this assignment.</div>
          ) : (
            <div className="space-y-2">
              {assignmentLinks.map((l) => {
                const label =
                  l.link_type === 'all_self'
                    ? `SELF Bundle (${l.questionnaires?.length || 0} questionnaires)`
                    : `OTHER (${l.questionnaires?.length || 0} questionnaire)`;

                return (
                  <div
                    key={l.link_id}
                    className={`flex flex-col gap-2 rounded border p-3 ${
                      l.link_id === submission.link_id ? 'border-gray-900' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-900">
                          Link #{l.link_id} — {label}
                        </div>
                        <StatusBadge submitted={!!l.is_submitted} />
                      </div>

                      {l.link_type === 'single_other' ? (
                        <div className="text-sm text-gray-700">
                          <span className="text-gray-500">Report by:</span>{' '}
                          <span className="font-semibold">{l.report_by || '—'}</span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Report by: —</div>
                      )}
                    </div>

                    <div className="text-xs text-gray-600">
                      Assigned: {l.created_at ? new Date(l.created_at).toLocaleString('it-IT') : '–'}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {/* open result page */}
                      <Link href={`/admin/dashboard/patients/${patientId}/submissions/${l.link_id}`}>
                        <Button size="sm" variant={l.link_id === submission.link_id ? 'default' : 'outline'}>
                          View
                        </Button>
                      </Link>

                      {l.url ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(l.url!, l.link_id)}
                            className="gap-2"
                          >
                            <Copy size={16} />
                            {copied === l.link_id ? 'Copied!' : 'Copy link'}
                          </Button>

                          <a href={l.url} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline" className="gap-2">
                              <ExternalLink size={16} />
                              Open
                            </Button>
                          </a>
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Screenshot-style dark table */}
      <div className="overflow-x-auto rounded-lg border">
        {/* header strip */}
        <div className="overflow-x-auto rounded-t-lg border border-white/10">
          <table className="w-full border-collapse bg-[#222] text-white">
            <tbody>
              <tr className="bg-[#1b1b1b]">
                <td className="border border-white/20 px-3 py-2 font-semibold">
                  Scolarità: <span className="text-yellow-300">{headerInfo.education}</span>
                </td>
                <td className="border border-white/20 px-3 py-2 font-semibold">
                  Età: <span className="text-yellow-300">{headerInfo.age}</span>
                </td>
                <td className="border border-white/20 px-3 py-2 font-semibold">
                  Sesso: <span className="text-yellow-300">{headerInfo.sex}</span>
                </td>
                <td className="border border-white/20 px-3 py-2 font-semibold">
                  Mano dominante: <span className="text-yellow-300">{headerInfo.handedness}</span>
                </td>
              </tr>

              <tr>
                <td className="border border-white/20 px-3 py-2 text-white/80" colSpan={4}>
                  <span className="font-semibold italic">
                    Valutazione neuropsicologica ambulatoriale del {reportDate}
                  </span>
                  {isOther ? (
                    <span className="ml-3 text-yellow-300 font-semibold">
                      — Report by: {reporterName}
                    </span>
                  ) : null}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <table className="w-full border-collapse bg-[#222] text-white">
          <thead>
            <tr className="bg-[#1b1b1b]">
              <th className="border border-white/20 px-3 py-2 text-left font-semibold w-[50%]">TEST</th>
              <th className="border border-white/20 px-3 py-2 text-center font-semibold w-[10%]">PG</th>
              <th className="border border-white/20 px-3 py-2 text-center font-semibold w-[10%]">PC</th>
              <th className="border border-white/20 px-3 py-2 text-center font-semibold w-[10%]">CUT-OFF</th>
              <th className="border border-white/20 px-3 py-2 text-center font-semibold w-[10%]">STAT</th>
              <th className="border border-white/20 px-3 py-2 text-center font-semibold w-[10%]">ESITO</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="border border-white/20 px-3 py-2 font-semibold italic" colSpan={6}>
                Scale Funzionali e Psico-Comportamentali
              </td>
            </tr>

            {Object.keys(resultsObj).length === 0 ? (
              <tr>
                <td className="border border-white/20 px-3 py-3 text-white/80" colSpan={6}>
                  No computed results found (this link may not be submitted yet).
                </td>
              </tr>
            ) : (
              Object.entries(resultsObj).map(([formCode, resultDict]) => (
                <tbody key={formCode}>
                  {/* form header row */}
                  <tr>
                    <td className="border border-white/20 px-3 py-2 font-semibold" colSpan={6}>
                      {formCode}
                      {/* ✅ if this link is OTHER, show reporter name */}
                      {isOther ? <span className="ml-2 text-yellow-300">— {reporterName}</span> : null}
                    </td>
                  </tr>

                  {groupResultRows(resultDict || {}).map(({ group, items }) => (
                    <tbody key={`${formCode}-${group}`}>
                      <tr>
                        <td className="border border-white/20 px-3 py-2 font-semibold italic" colSpan={6}>
                          {group}
                        </td>
                      </tr>

                      {items.map((it) => (
                        <tr key={`${formCode}-${group}-${it.label}`}>
                          <td className="border border-white/20 px-3 py-2 pl-10 text-white/90 italic">{it.label}</td>

                          {/* computed value in PG column */}
                          <td className="border border-white/20 px-3 py-2 text-center font-semibold">
                            {String(it.value)}
                          </td>

                          <td className="border border-white/20 px-3 py-2 text-center text-white/50">—</td>
                          <td className="border border-white/20 px-3 py-2 text-center text-white/50">—</td>
                          <td className="border border-white/20 px-3 py-2 text-center text-white/50">—</td>
                          <td className="border border-white/20 px-3 py-2 text-center text-white/50">—</td>
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </tbody>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
