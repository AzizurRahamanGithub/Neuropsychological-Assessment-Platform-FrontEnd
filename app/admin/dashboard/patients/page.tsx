'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus, Search, Edit2, Trash2, Eye, AlertCircle, X } from 'lucide-react';
import type { Patient } from '@/types';

const Loading = () => null;

// ---------------- API ----------------
const API_BASE = 'http://10.0.30.73:8000/api/v1';
const PATIENTS_LIST_URL = `${API_BASE}/patients/list/`;

// ---------------- Types ----------------
type Sex = 'M' | 'F' | 'O';
type Handedness = 'right' | 'left';

type PatientForm = {
  name: string;
  surname: string;
  sex: Sex | '';
  dateOfBirth: string; // YYYY-MM-DD
  yearsOfEducation: string; // keep string for input then parse
  handedness: Handedness | '';
};

type ApiPatient = {
  id: number;
  name: string;
  surname: string;
  sex: string; // "male"/"female"/"other"
  birth: string;
  education: number;
  handedness: string;
  created_at: string;
  updated_at: string;
};

type ApiListResponse = {
  success: boolean;
  status_code: number;
  message: string;
  data: ApiPatient[];
};

// ---------------- Helpers ----------------
const apiSexToUiSex = (sex: string): Sex => {
  const s = (sex || '').toLowerCase();
  if (s === 'male' || s === 'm') return 'M';
  if (s === 'female' || s === 'f') return 'F';
  return 'O';
};

const uiSexToApiSex = (sex: Sex): string => {
  if (sex === 'M') return 'male';
  if (sex === 'F') return 'female';
  return 'other';
};

const mapApiPatientToUi = (p: ApiPatient): Patient => ({
  id: p.id,
  name: p.name,
  surname: p.surname,
  sex: apiSexToUiSex(p.sex) as any,
  dateOfBirth: p.birth,
  yearsOfEducation: p.education,
  handedness: (p.handedness || '').toLowerCase() as any,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
});

const getAge = (dob?: string) => {
  if (!dob) return '';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return String(age);
};

// ✅ Search across: name, surname, full name, id, sex, dob, age, education, handedness, created/updated
const applySearch = (base: Patient[], term: string) => {
  const t = term.trim().toLowerCase();
  if (!t) return base;

  return base.filter((p) => {
    const age = getAge(p.dateOfBirth);
    const sexLabel = p.sex === 'M' ? 'male' : p.sex === 'F' ? 'female' : 'other';

    const haystack = [
      p.name,
      p.surname,
      `${p.name} ${p.surname}`,
      String(p.id ?? ''),
      p.sex,
      sexLabel,
      p.dateOfBirth,
      age,
      String(p.yearsOfEducation ?? ''),
      p.handedness ?? '',
      p.createdAt ?? '',
      p.updatedAt ?? '',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(t);
  });
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // ---- Modal state ----
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState<PatientForm>({
    name: '',
    surname: '',
    sex: '',
    dateOfBirth: '',
    yearsOfEducation: '',
    handedness: '',
  });
  const [formError, setFormError] = useState<string>('');

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const res = await fetch(PATIENTS_LIST_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // যদি Token auth হয়: `Token ${token}`
        },
        cache: 'no-store',
      });

      const json: ApiListResponse = await res.json().catch(() => ({} as any));

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to load patients');
      }

      const list = (json.data || []).map(mapApiPatientToUi);

      setPatients(list);
      setFilteredPatients(applySearch(list, searchTerm));
    } catch (err: any) {
      setError(err?.message || 'Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ keep filtered list synced
  useEffect(() => {
    setFilteredPatients(applySearch(patients, searchTerm));
  }, [patients, searchTerm]);

  const handleSearch = (term: string) => setSearchTerm(term);

  const handleDelete = async (patientId: number) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;

    // TODO: delete endpoint থাকলে integrate করবো
    const next = patients.filter((p) => p.id !== patientId);
    setPatients(next);
  };

  // ---- Add modal handlers ----
  const openAdd = () => {
    setFormError('');
    setForm({
      name: '',
      surname: '',
      sex: '',
      dateOfBirth: '',
      yearsOfEducation: '',
      handedness: '',
    });
    setIsAddOpen(true);
  };

  const closeAdd = () => {
    setIsAddOpen(false);
    setFormError('');
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.surname.trim()) return 'Surname is required.';
    if (!form.sex) return 'Sex is required.';
    if (!form.dateOfBirth) return 'Date of birth is required.';
    if (!form.yearsOfEducation) return 'Years of education is required.';
    const y = Number(form.yearsOfEducation);
    if (!Number.isFinite(y) || y < 0 || y > 40) return 'Years of education must be between 0 and 40.';
    if (!form.handedness) return 'Handedness is required.';
    return '';
  };

  const handleAddPatient = async () => {
    setFormError('');
    const msg = validateForm();
    if (msg) {
      setFormError(msg);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setFormError('Authentication required');
        return;
      }

      const payload = {
        name: form.name.trim(),
        surname: form.surname.trim(),
        sex: uiSexToApiSex(form.sex as Sex),
        birth: form.dateOfBirth,
        education: Number(form.yearsOfEducation),
        handedness: form.handedness, // 'right' | 'left'
      };

      const res = await fetch(PATIENTS_LIST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // যদি Token auth হয়: `Token ${token}`
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({} as any));

      if (!res.ok || !json?.success) {
        const errMsg =
          json?.message ||
          (typeof json?.data === 'string' ? json.data : '') ||
          'Failed to create patient';
        throw new Error(errMsg);
      }

      await loadPatients(); // most reliable
      closeAdd();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create patient');
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        {/* Header */}
        {/* <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-600 mt-1">Manage your patient profiles</p>
          </div>

          <Button className="gap-2" onClick={openAdd}>
            <Plus size={20} />
            Add Patient
          </Button>
        </div> */}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input
                  placeholder="Search by name, age, sex, education..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Patients ({filteredPatients.length})</CardTitle>
            <CardDescription>Complete list of registered patients</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-600">Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                {searchTerm ? 'No patients found matching your search' : 'No patients yet'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Sex</TableHead>
                      <TableHead className="font-semibold">Date of Birth</TableHead>
                      <TableHead className="font-semibold">Education</TableHead>
                      <TableHead className="font-semibold">Handedness</TableHead>
                      <TableHead className="font-semibold">Registered</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {patient.name} {patient.surname}
                        </TableCell>
                        <TableCell>
                          {patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : 'Other'}
                        </TableCell>
                        <TableCell>
                          {patient.dateOfBirth
                            ? new Date(patient.dateOfBirth).toLocaleDateString('it-IT')
                            : '–'}
                        </TableCell>
                        <TableCell>{patient.yearsOfEducation || '–'} years</TableCell>
                        <TableCell>{patient.handedness || '–'}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('it-IT') : '–'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Link href={`/admin/dashboard/patients/${patient.id}`}>
                              <Button variant="ghost" size="sm" className="gap-1" title="View details">
                                <Eye size={16} />
                              </Button>
                            </Link>
                            <Link href={`/admin/dashboard/patients/${patient.id}/edit`}>
                              <Button variant="ghost" size="sm" className="gap-1" title="Edit patient">
                                <Edit2 size={16} />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(patient.id)}
                              title="Delete patient"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ADD PATIENT MODAL */}
        {isAddOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeAdd();
            }}
          >
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Add Patient</h2>
                  <p className="text-sm text-gray-600">Create a new patient profile</p>
                </div>
                <button
                  onClick={closeAdd}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4">
                {formError && (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Giovanni"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Surname</label>
                    <Input
                      value={form.surname}
                      onChange={(e) => setForm((p) => ({ ...p, surname: e.target.value }))}
                      placeholder="e.g. Rossi"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sex</label>
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={form.sex}
                      onChange={(e) => setForm((p) => ({ ...p, sex: e.target.value as any }))}
                    >
                      <option value="">Select...</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                    <Input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Years of Education</label>
                    <Input
                      type="number"
                      min={0}
                      max={40}
                      value={form.yearsOfEducation}
                      onChange={(e) => setForm((p) => ({ ...p, yearsOfEducation: e.target.value }))}
                      placeholder="e.g. 13"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Handedness</label>
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={form.handedness}
                      onChange={(e) => setForm((p) => ({ ...p, handedness: e.target.value as any }))}
                    >
                      <option value="">Select...</option>
                      <option value="right">Right</option>
                      <option value="left">Left</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
                <Button variant="outline" onClick={closeAdd}>
                  Cancel
                </Button>
                <Button onClick={handleAddPatient}>Add Patient</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}
