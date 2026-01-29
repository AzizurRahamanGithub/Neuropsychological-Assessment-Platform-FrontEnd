'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { ArrowLeft, AlertCircle, CheckCircle, Clock, Copy, ExternalLink, Eye } from 'lucide-react';

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
  results: Record<string, Record<string, any>> | null;
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


type Col = "PG" | "PC" | "CUTOFF" | "STAT" | "ESITO";

type Row = {
  test: string; // e.g. "Disattenzione punteggio"
  PG: any;
  PC: any;
  CUTOFF: any;
  STAT: any;
  ESITO: any;
};

const COLS: Col[] = ["PG", "PC", "CUTOFF", "STAT", "ESITO"];

function buildRowsFromHintedKeys(resultDict: Record<string, any>): Row[] {
  const map = new Map<string, Partial<Row>>(); // preserves insertion order

  for (const [k, v] of Object.entries(resultDict || {})) {
    const key = String(k || "").trim();

    // ignore non-table keys
    const low = key.toLowerCase();
    if (low.includes("ambienti") || low.includes("norms age band")) continue;

    // "<TEST> <COL>" where COL is last word
    const m = key.match(/^(.*)\s+(PG|PC|CUTOFF|STAT|ESITO)$/i);
    if (!m) continue;

    const test = m[1].trim();
    const col = m[2].toUpperCase() as Col;

    const row = map.get(test) || { test };
    (row as any)[col] = v;
    map.set(test, row);
  }

  // fill missing columns with —
  return Array.from(map.values()).map((r) => {
    const out: any = { test: (r as any).test };
    for (const c of COLS) {
      const val = (r as any)[c];
      out[c] = val === undefined || val === null || val === "" ? "—" : val;
    }
    return out as Row;
  });
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

function LinkTypeBadge({ t }: { t: Submission['link_type'] }) {
  const isSelf = t === 'all_self';
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-1 text-xs font-semibold ${isSelf ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-800'
        }`}
    >
      {isSelf ? 'SELF' : 'OTHER'}
    </span>
  );
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const patientId = params.id as string;
  const linkId = Number((params as any).linkid as string);

  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<number | null>(null);

  // Refs for smooth scrolling to specific link results
  const linkResultRefs = useRef<Record<number, HTMLDivElement | null>>({});

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
    } catch { }
  };

  // Smooth scroll to specific link results
  const scrollToLinkResults = (linkId: number) => {
    const element = linkResultRefs.current[linkId];
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });

      // Add highlight effect
      element.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
      setTimeout(() => {
        element.style.boxShadow = '';
      }, 2000);
    }
  };

  if (loading) return <div className="p-8 text-gray-600">Loading...</div>;

  if (!patient || !submission || !assignment || !headerInfo || !Number.isFinite(linkId)) {
    return (
      <div className="p-8 space-y-4">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top section with cards */}
      <div className=" mx-auto px-6 py-6 space-y-6">
        <Link href={`/admin/dashboard/patients/${patientId}`}>
          <Button className='mb-10' variant="outline" size="sm">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>
              {patient.name} {patient.surname} — Assignment #{assignment.assignment_id}
            </CardTitle>
          </CardHeader>

          <CardContent className="text-sm text-gray-600 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">Report Date:</span> {reportDate}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Links with View button */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assignment Links</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {assignmentLinks.map((l) => {
              const isOther = l.link_type === 'single_other';
              // Get questionnaire names from results
              const questionnaireNames = l.results ? Object.keys(l.results) : l.questionnaires || [];

              return (
                <div key={l.link_id} className="rounded border border-gray-200 bg-white p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {/* Show questionnaire codes instead of Link # */}
                      <div className="font-semibold text-gray-900">
                        {questionnaireNames.length > 0
                          ? questionnaireNames.join(', ')
                          : `Link #${l.link_id}`
                        }
                      </div>
                      <LinkTypeBadge t={l.link_type} />
                      <StatusBadge submitted={!!l.is_submitted} />
                    </div>

                    <div className="text-sm text-gray-700">
                      <span className="text-gray-500">Report by:</span>{' '}
                      <span className="font-semibold">{isOther ? l.report_by || '—' : '—'}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Assigned: {l.created_at ? new Date(l.created_at).toLocaleString('it-IT') : '–'}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* View Button - scroll to results */}
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => scrollToLinkResults(l.link_id)}
                      className="gap-2"
                    >
                      <Eye size={16} />
                      View
                    </Button>

                    {l.url && (
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
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Full width results section */}
      <div className="w-full bg-gradient-to-b from-gray-800 to-gray-900 py-10">
        <div className="px-6">
          <div className="max-w-[95vw] mx-auto space-y-6">
            {/* Patient header info */}
            <div className="overflow-x-auto rounded-lg shadow-2xl">
              <table
                style={{
                  width: '100%',
                  minWidth: '1000px',
                  borderCollapse: 'collapse',
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                }}
              >
                <tbody>
                  <tr style={{ backgroundColor: '#111111' }}>
                    <td
                      style={{
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '12px 16px',
                        fontWeight: 600,
                      }}
                    >
                      Scolarità: <span style={{ color: '#fbbf24' }}>{headerInfo.education}</span>
                    </td>
                    <td
                      style={{
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '12px 16px',
                        fontWeight: 600,
                      }}
                    >
                      Età: <span style={{ color: '#fbbf24' }}>{headerInfo.age}</span>
                    </td>
                    <td
                      style={{
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '12px 16px',
                        fontWeight: 600,
                      }}
                    >
                      Sesso: <span style={{ color: '#fbbf24' }}>{headerInfo.sex}</span>
                    </td>
                    <td
                      style={{
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '12px 16px',
                        fontWeight: 600,
                      }}
                    >
                      Mano dominante: <span style={{ color: '#fbbf24' }}>{headerInfo.handedness}</span>
                    </td>
                  </tr>

                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '12px 16px',
                        color: 'rgba(255, 255, 255, 0.85)',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontStyle: 'italic' }}>
                        Valutazione neuropsicologica ambulatoriale del {reportDate}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ALL QUESTIONNAIRES - with refs for scrolling */}
            {assignmentLinks.map((link) => {
              const isOther = link.link_type === 'single_other';
              const reporterName = isOther ? link.report_by || '—' : null;
              const resultsObj = link.results || {};
              const hasResults = Object.keys(resultsObj).length > 0;
              const questionnaireNames = hasResults ? Object.keys(resultsObj) : link.questionnaires || [];

              return (
                <div
                  key={`link-results-${link.link_id}`}
                  ref={(el) => { linkResultRefs.current[link.link_id] = el; }}
                  className="space-y-4 transition-shadow duration-300"
                  style={{
                    scrollMarginTop: '100px',
                    borderRadius: '8px'
                  }}
                >
                  {/* Link header - show questionnaire names */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-white">
                        {questionnaireNames.length > 0
                          ? questionnaireNames.join(' • ')
                          : `Link #${link.link_id}`
                        }
                      </h3>
                      <LinkTypeBadge t={link.link_type} />
                      <StatusBadge submitted={!!link.is_submitted} />
                    </div>

                    {isOther && (
                      <div className="text-sm text-gray-300">
                        <span className="text-gray-400">Report by:</span>{' '}
                        <span className="font-semibold text-yellow-300">{reporterName}</span>
                      </div>
                    )}
                  </div>

                  {/* Results table */}
                  <div className="overflow-x-auto rounded-lg shadow-2xl">
                    <table
                      style={{
                        width: '100%',
                        minWidth: '1000px',
                        borderCollapse: 'collapse',
                        backgroundColor: '#1f1f1f',
                        color: '#ffffff',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#0f0f0f' }}>
                          <th
                            style={{
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              padding: '12px 16px',
                              textAlign: 'left',
                              fontWeight: 600,
                              fontSize: '14px',
                            }}
                          >
                            TEST
                          </th>
                          <th
                            style={{
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              padding: '12px 16px',
                              textAlign: 'center',
                              fontWeight: 600,
                              fontSize: '14px',
                            }}
                          >
                            PG
                          </th>
                          <th
                            style={{
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              padding: '12px 16px',
                              textAlign: 'center',
                              fontWeight: 600,
                              fontSize: '14px',
                            }}
                          >
                            PC
                          </th>
                          <th
                            style={{
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              padding: '12px 16px',
                              textAlign: 'center',
                              fontWeight: 600,
                              fontSize: '14px',
                            }}
                          >
                            CUT-OFF
                          </th>
                          <th
                            style={{
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              padding: '12px 16px',
                              textAlign: 'center',
                              fontWeight: 600,
                              fontSize: '14px',
                            }}
                          >
                            STAT
                          </th>
                          <th
                            style={{
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              padding: '12px 16px',
                              textAlign: 'center',
                              fontWeight: 600,
                              fontSize: '14px',
                            }}
                          >
                            ESITO
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {!hasResults ? (
                          <tr>
                            <td
                              colSpan={6}
                              style={{
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                padding: '24px 16px',
                                textAlign: 'center',
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontStyle: 'italic',
                              }}
                            >
                              No results available yet (link may not be submitted)
                            </td>
                          </tr>
                        ) : (
                          <>
                            <>
                              {Object.entries(resultsObj).map(([formCode, resultDict]) => {
                                const rows = buildRowsFromHintedKeys(resultDict || {});
                                const env = (resultDict as any)?.["Ambienti con difficoltà"] ?? "—";
                                const band = (resultDict as any)?.["Norms age band"] ?? "—";

                                return (
                                  <React.Fragment key={`${link.link_id}-${formCode}`}>
                                    {/* Questionnaire header */}
                                    <tr>
                                      <td
                                        colSpan={6}
                                        style={{
                                          border: "1px solid rgba(255, 255, 255, 0.2)",
                                          padding: "12px 16px",
                                          fontWeight: 700,
                                          fontSize: "15px",
                                          backgroundColor: "#0a0a0a",
                                        }}
                                      >
                                        {formCode}
                                        {isOther && (
                                          <span style={{ marginLeft: "12px", color: "#fbbf24", fontWeight: 600 }}>
                                            — {reporterName}
                                          </span>
                                        )}
                                      </td>
                                    </tr>

                                    {/* Data rows */}
                                    {rows.length === 0 ? (
                                      <tr>
                                        <td
                                          colSpan={6}
                                          style={{
                                            border: "1px solid rgba(255, 255, 255, 0.2)",
                                            padding: "24px 16px",
                                            textAlign: "center",
                                            color: "rgba(255, 255, 255, 0.6)",
                                            fontStyle: "italic",
                                          }}
                                        >
                                          No table rows found for this questionnaire.
                                        </td>
                                      </tr>
                                    ) : (
                                      rows.map((r) => (
                                        <tr key={`${link.link_id}-${formCode}-${r.test}`}>
                                          <td
                                            style={{
                                              border: "1px solid rgba(255, 255, 255, 0.2)",
                                              padding: "10px 16px",
                                              color: "rgba(255, 255, 255, 0.85)",
                                              fontStyle: "italic",
                                            }}
                                          >
                                            {r.test}
                                          </td>

                                          <td style={{ border: "1px solid rgba(255,255,255,0.2)", padding: "10px 16px", textAlign: "center", fontWeight: 600 }}>
                                            {String(r.PG)}
                                          </td>

                                          <td style={{ border: "1px solid rgba(255,255,255,0.2)", padding: "10px 16px", textAlign: "center", fontWeight: 600 }}>
                                            {String(r.PC)}
                                          </td>

                                          <td style={{ border: "1px solid rgba(255,255,255,0.2)", padding: "10px 16px", textAlign: "center", fontWeight: 600 }}>
                                            {String(r.CUTOFF)}
                                          </td>

                                          <td style={{ border: "1px solid rgba(255,255,255,0.2)", padding: "10px 16px", textAlign: "center", fontWeight: 600 }}>
                                            {String(r.STAT)}
                                          </td>

                                          <td style={{ border: "1px solid rgba(255,255,255,0.2)", padding: "10px 16px", textAlign: "center", fontWeight: 600 }}>
                                            {String(r.ESITO)}
                                          </td>
                                        </tr>
                                      ))
                                    )}

                                    {/* Optional footer row */}
                                    <tr>
                                      <td
                                        colSpan={6}
                                        style={{
                                          border: "1px solid rgba(255, 255, 255, 0.2)",
                                          padding: "10px 16px",
                                          backgroundColor: "#151515",
                                          color: "rgba(255, 255, 255, 0.85)",
                                        }}
                                      >
                                        <span style={{ fontWeight: 600 }}>Ambienti con difficoltà:</span> {String(env)}
                                        <span style={{ marginLeft: 14, opacity: 0.8 }}>
                                          (Norms age band: {String(band)})
                                        </span>
                                      </td>
                                    </tr>
                                  </React.Fragment>
                                );
                              })}
                            </>


                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}