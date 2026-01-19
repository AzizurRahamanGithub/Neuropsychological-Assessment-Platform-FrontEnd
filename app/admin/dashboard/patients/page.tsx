'use client';

import { useState, useEffect } from 'react';
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
import { Plus, Search, Edit2, Trash2, Eye, AlertCircle } from 'lucide-react';
import type { Patient } from '@/types';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const Loading = () => null;

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const searchParams = useSearchParams();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Mock data - replace with actual API call
      const mockPatients: Patient[] = [
        {
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
        },
        {
          id: 2,
          userId: 2,
          name: 'Maria',
          surname: 'Bianchi',
          sex: 'F',
          dateOfBirth: '1988-03-22',
          yearsOfEducation: 16,
          clinicianId: 1,
          createdAt: '2024-01-09',
          updatedAt: '2024-01-09',
        },
        {
          id: 3,
          userId: 3,
          name: 'Paolo',
          surname: 'Verdi',
          sex: 'M',
          dateOfBirth: '1995-07-08',
          yearsOfEducation: 14,
          clinicianId: 1,
          createdAt: '2024-01-08',
          updatedAt: '2024-01-08',
        },
        {
          id: 4,
          userId: 4,
          name: 'Laura',
          surname: 'Rizzo',
          sex: 'F',
          dateOfBirth: '1992-11-30',
          yearsOfEducation: 13,
          clinicianId: 1,
          createdAt: '2024-01-07',
          updatedAt: '2024-01-07',
        },
      ];

      setPatients(mockPatients);
      setFilteredPatients(mockPatients);
    } catch (err: any) {
      setError(err?.message || 'Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    const filtered = patients.filter((patient) => {
      const fullName = `${patient.name} ${patient.surname}`.toLowerCase();
      return fullName.includes(term.toLowerCase());
    });
    
    setFilteredPatients(filtered);
  };

  const handleDelete = async (patientId: number) => {
    if (!confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    try {
      // TODO: Call API to delete patient
      setPatients(patients.filter(p => p.id !== patientId));
      setFilteredPatients(filteredPatients.filter(p => p.id !== patientId));
    } catch (err: any) {
      setError('Failed to delete patient');
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-600 mt-1">Manage your patient profiles</p>
          </div>
          <Link href="/admin/dashboard/patients/new">
            <Button className="gap-2">
              <Plus size={20} />
              Add Patient
            </Button>
          </Link>
        </div>

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
                  placeholder="Search by name..."
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
            <CardTitle>
              Patients ({filteredPatients.length})
            </CardTitle>
            <CardDescription>
              Complete list of registered patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-600">
                Loading patients...
              </div>
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
                        <TableCell>{patient.sex || '–'}</TableCell>
                        <TableCell>
                          {patient.dateOfBirth
                            ? new Date(patient.dateOfBirth).toLocaleDateString('it-IT')
                            : '–'}
                        </TableCell>
                        <TableCell>{patient.yearsOfEducation || '–'} years</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(patient.createdAt).toLocaleDateString('it-IT')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Link href={`/admin/dashboard/patients/${patient.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                                title="View details"
                              >
                                <Eye size={16} />
                              </Button>
                            </Link>
                            <Link href={`/admin/dashboard/patients/${patient.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                                title="Edit patient"
                              >
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
      </div>
    </Suspense>
  );
}
