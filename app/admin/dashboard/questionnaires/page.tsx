"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { makeSlug } from "@/src/lib/slug";

import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  fetchPatients,
  setSelectedPatientId,
} from "@/src/store/slices/patientsSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Copy, CheckCircle, AlertCircle } from "lucide-react";

import { QUESTIONNAIRE_REGISTRY } from "@/lib/questionnaires";
import type { Patient, Questionnaire } from "@/src/types";

type LinkType = "all_self" | "single_other";

interface GeneratedLink {
  type: LinkType;
  url: string;
  questionnaireName: string;
  expiresAt: string;
}

type AssignmentLinkPayload = {
  link_type: LinkType;
  token: string;
  questionnaires: string[];
  report_by: string | null;
  url?: string;
};

function isValidAbsUrl(u?: string) {
  return !!u && /^https?:\/\/.+/i.test(u.trim());
}

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export default function QuestionnairesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    list: patientList,
    isLoading: isPatientsLoading,
    selectedPatientId,
  } = useAppSelector((s) => s.patients);

  useEffect(() => {
    if (!patientList.length) dispatch(fetchPatients());
  }, [dispatch, patientList.length]);

  const [assigning, setAssigning] = useState(false);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<
    number[]
  >([]);
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([]);
  const [error, setError] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<string>("");
  const [qLoading, setQLoading] = useState(true);
  const [qSearch, setQSearch] = useState("");

  // ✅ absolute URL builder
  const makeQuestionnaireUrl = (token: string) => {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").trim();

    if (appUrl && /^https?:\/\//i.test(appUrl)) {
      return `${appUrl.replace(/\/$/, "")}/questionnaire/${token}`;
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    if (!origin || !/^https?:\/\//i.test(origin)) {
      throw new Error(
        "Invalid APP URL. Set NEXT_PUBLIC_APP_URL like http://10.0.30.175:3000",
      );
    }
    return `${origin}/questionnaire/${token}`;
  };

  function buildLinksPayload(
    all: Questionnaire[],
    selectedIds: number[],
  ): AssignmentLinkPayload[] {
    const picked = all.filter((q) => selectedIds.includes(q.id));

    const self = picked.filter((q) => q.type === "SELF");
    const other = picked.filter((q) => q.type === "OTHER");

    const links: AssignmentLinkPayload[] = [];

    if (self.length) {
      const token = makeSlug(40);
      links.push({
        link_type: "all_self",
        token,
        questionnaires: self.map((q) => q.code),
        report_by: null,
        url: makeQuestionnaireUrl(token),
      });
    }

    for (const q of other) {
      const token = makeSlug(40);
      links.push({
        link_type: "single_other",
        token,
        questionnaires: [q.code],
        report_by: null, // later set from UI (mother/father/etc)
        url: makeQuestionnaireUrl(token),
      });
    }

    return links;
  }

  // ✅ Load questionnaires from registry (FIXED: add version)
  useEffect(() => {
    try {
      setQLoading(true);
      setError("");

      const modules = Object.values(QUESTIONNAIRE_REGISTRY) as any[];

      const list: Questionnaire[] = modules.map((m, idx) => ({
        id: idx + 1,
        code: String(m?.def?.formCode ?? m?.def?.code ?? `Q_${idx + 1}`),
        name: String(m?.def?.name ?? "Untitled"),
        description: String(m?.def?.instruction ?? ""),
        type: m?.def?.type === "SELF" ? "SELF" : "OTHER",
        category: String(m?.def?.code ?? ""),
        questionCount: Array.isArray(m?.def?.questions)
          ? m.def.questions.length
          : 0,
        createdAt: "2024-01-01",

        // ✅ REQUIRED BY YOUR TS TYPE
        version: String(m?.def?.version ?? "1.0.0"),
      }));

      setQuestionnaires(list);
    } catch (err: any) {
      setError(err?.message || "Failed to load questionnaires");
    } finally {
      setQLoading(false);
    }
  }, []);

  const filteredQuestionnaires = useMemo(() => {
    const t = qSearch.trim().toLowerCase();
    if (!t) return questionnaires;

    return questionnaires.filter((q) =>
      `${q.name} ${q.description || ""} ${q.type || ""} ${q.code || ""} ${q.category || ""} ${q.version || ""}`
        .toLowerCase()
        .includes(t),
    );
  }, [qSearch, questionnaires]);

  const handleSelectQuestionnaire = (questionnaireId: number) => {
    setSelectedQuestionnaires((prev) =>
      prev.includes(questionnaireId)
        ? prev.filter((id) => id !== questionnaireId)
        : [...prev, questionnaireId],
    );
  };

  async function createAssignment(payload: any) {
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
      /\/$/,
      "",
    );
    if (!base) throw new Error("NEXT_PUBLIC_API_BASE_URL missing");

    const url = `${base}/questionnaire/assignments/`;
    const token = localStorage.getItem("accessToken");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await safeJson(res);

    // ✅ show backend validation details properly
    if (!res.ok || data?.success === false) {
      const detail = data?.error
        ? `\n\n${JSON.stringify(data.error, null, 2)}`
        : data?.raw
          ? `\n\n${String(data.raw)}`
          : "";

      throw new Error(
        `${data?.message || data?.detail || "Request failed"}${detail}`,
      );
    }

    return data;
  }

  const handleAssignQuestionnaires = async () => {
    setError("");

    if (!selectedPatientId || selectedQuestionnaires.length === 0) {
      setError("Please select a patient and at least one questionnaire");
      return;
    }
    if (assigning) return;

    setAssigning(true);
    try {
      const linksPayload = buildLinksPayload(
        questionnaires,
        selectedQuestionnaires,
      );

      const payload = {
        patient_id: Number(selectedPatientId),
        links: linksPayload.map((l) => {
          const obj: any = {
            link_type: l.link_type,
            token: l.token,
            questionnaires: l.questionnaires,
            report_by: l.report_by ?? null,
          };
          if (isValidAbsUrl(l.url)) obj.url = l.url!.trim();
          return obj;
        }),
      };

      // Debug
      console.log("DEBUG linksPayload:", linksPayload);
      console.log("DEBUG payload:", payload);

      await createAssignment(payload);

      const uiLinks: GeneratedLink[] = linksPayload.map((l) => ({
        type: l.link_type,
        url: l.url || "",
        questionnaireName:
          l.link_type === "all_self"
            ? `${l.questionnaires.length} SELF questionnaires`
            : "OTHER questionnaire",
        expiresAt: "Never",
      }));

      setGeneratedLinks(uiLinks);
    } catch (e: any) {
      // ✅ keep the real error (don’t overwrite with “Network error”)
      setError(e?.message || "Failed to assign questionnaires");
    } finally {
      setAssigning(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(url);
      setTimeout(() => setCopiedLink(""), 2000);
    } catch {}
  };

  const selectedPatientName =
    patientList.find((p: Patient) => p.id.toString() === selectedPatientId)
      ?.name || "";

  if (qLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading questionnaires...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questionnaires</h1>
          <p className="text-gray-600 mt-1">Manage and assign assessments</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription style={{ whiteSpace: "pre-wrap" }}>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {generatedLinks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Assign Questionnaires to Patient</CardTitle>
            <CardDescription>
              Select a patient and choose which questionnaires to assign
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Patient
              </label>

              <Select
                value={selectedPatientId}
                onValueChange={(v) => dispatch(setSelectedPatientId(v))}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isPatientsLoading ? "Loading..." : "Choose a patient..."
                    }
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
                  <p className="text-sm text-gray-600">
                    No questionnaires found.
                  </p>
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
                        <p className="text-sm text-gray-600 mt-1">
                          {q.description}
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {q.type}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {q.questionCount} questions
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                            v{q.version}
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
              disabled={
                assigning ||
                !selectedPatientId ||
                selectedQuestionnaires.length === 0
              }
              className="w-full"
            >
              {assigning ? "Assigning..." : "Generate Links & Assign"}
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
              Generated secure links for {selectedPatientName}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {generatedLinks.map((link, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-green-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {link.questionnaireName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Expires: {link.expiresAt}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {link.type === "all_self" ? "Self-Report" : "Informant"}
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
                    {copiedLink === link.url ? "Copied!" : "Copy"}
                  </Button>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(link.url, "_blank")}
                  >
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
                dispatch(setSelectedPatientId(""));
              }}
            >
              Assign More Questionnaires
            </Button>
          </CardContent>
        </Card>
      )}

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
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredQuestionnaires.map((q) => (
                  <TableRow
                    key={q.id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      router.push(`/admin/dashboard/questionnaires/${q.code}`)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(
                          `/admin/dashboard/questionnaires/${q.code}`,
                        );
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
                          q.type === "SELF"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {q.type}
                      </span>
                    </TableCell>

                    <TableCell className="text-gray-700">
                      {q.category}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {q.questionCount}
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
