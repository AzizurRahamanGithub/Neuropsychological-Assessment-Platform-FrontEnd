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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileDown,
  FileText,
  Search,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
// import { downloadFile, exportResultsToWord, exportResultsToCSV } from '@/lib/document-export';
// import type { QuestionnaireResult, Patient } from '@/types';
import { useSearchParams } from 'next/navigation';

interface ResultsListItem {
  id: number;
  patientName: string;
  questionnaireName: string;
  status: 'completed' | 'pending' | 'error';
  percentile: number;
  diagnosis: string;
  completedAt: string;
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<ResultsListItem[]>([]);
  const [filteredResults, setFilteredResults] = useState<ResultsListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setIsLoading(true);

      // Mock results data
      const mockResults: ResultsListItem[] = [
        {
          id: 1,
          patientName: 'Giovanni Rossi',
          questionnaireName: 'Barkley Adult ADHD Rating Scale-IV',
          status: 'completed',
          percentile: 95,
          diagnosis: 'ADHD - Clinical',
          completedAt: '2024-01-18',
        },
        {
          id: 2,
          patientName: 'Maria Bianchi',
          questionnaireName: 'Conners ADHD Rating Scale',
          status: 'completed',
          percentile: 72,
          diagnosis: 'Borderline',
          completedAt: '2024-01-17',
        },
        {
          id: 3,
          patientName: 'Paolo Verdi',
          questionnaireName: 'SNAP-IV Parent Rating',
          status: 'pending',
          percentile: 0,
          diagnosis: 'Pending',
          completedAt: '',
        },
        {
          id: 4,
          patientName: 'Laura Rizzo',
          questionnaireName: 'Barkley Adult ADHD Rating Scale-IV',
          status: 'completed',
          percentile: 45,
          diagnosis: 'Non-ADHD',
          completedAt: '2024-01-15',
        },
      ];

      setResults(mockResults);
      setFilteredResults(mockResults);
    } catch (err: any) {
      setError(err?.message || 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(searchTerm, status);
  };

  const applyFilters = (search: string, status: string) => {
    let filtered = results;

    if (search) {
      filtered = filtered.filter((result) =>
        result.patientName.toLowerCase().includes(search.toLowerCase()) ||
        result.questionnaireName.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter((result) => result.status === status);
    }

    setFilteredResults(filtered);
  };

  // const handleExportWord = async (resultId: number) => {
  //   try {
  //     // Mock implementation - replace with actual API call
  //     const mockPatient: Patient = {
  //       id: 1,
  //       userId: 1,
  //       name: 'Giovanni',
  //       surname: 'Rossi',
  //       sex: 'M',
  //       dateOfBirth: '1990-05-15',
  //       yearsOfEducation: 13,
  //       clinicianId: 1,
  //       createdAt: '2024-01-10',
  //       updatedAt: '2024-01-10',
  //     };

  //     // const mockResults: QuestionnaireResult[] = [
  //     //   {
  //     //     id: 1,
  //     //     assignmentId: 1,
  //     //     questionnaireId: 1,
  //     //     patientId: 1,
  //     //     calculatedMetrics: {
  //     //       disattenzioniSintomi: 7,
  //     //       disattenzioniPunteggio: 24,
  //     //       iperattivitaPunteggio: 18,
  //     //       iperattivitaSintomi: 5,
  //     //       impulsivitaPunteggio: 12,
  //     //       impulsivitaSintomi: 3,
  //     //       iperattivitaImpulsivitaSintomi: 8,
  //     //       sctPunteggio: 5,
  //     //       sctSintomi: 2,
  //     //       etaInizioSintomi: 'Prima dei 12 anni',
  //     //       ambitiCompromissione: ['Lavoro', 'Relazioni'],
  //     //       totaleAdhPunteggio: 54,
  //     //       totaleAdhSintomi: 15,
  //     //       iperattivitaImpulsivitaPunteggio: 30,
  //     //       // iperattivitaImpulsivitaSintomi: 8,
  //     //     },
  //     //     rawScores: {},
  //     //     percentileRank: 95,
  //     //     statisticalSignificance: 'p < 0.01',
  //     //     cutOffStatus: 'Clinical',
  //     //     resultStatus: 'completed',
  //     //     createdAt: '2024-01-18',
  //     //     updatedAt: '2024-01-18',
  //     //   },
  //     // ];

  //     // const blob = await exportResultsToWord(mockPatient, mockResults);
  //     // downloadFile(blob, `Assessment_${mockPatient.name}_${mockPatient.surname}.docx`);
  //   } catch (err: any) {
  //     setError(err?.message || 'Failed to export document');
  //   }
  // };

  const handleExportCSV = () => {
    try {
      // Mock CSV export
      const csvContent = [
        'Patient,Questionnaire,Status,Percentile,Diagnosis,Date',
        ...filteredResults.map(
          (r) => `${r.patientName},${r.questionnaireName},${r.status},${r.percentile},${r.diagnosis},${r.completedAt}`,
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      // downloadFile(blob, 'Results_Export.csv');
    } catch (err: any) {
      setError(err?.message || 'Failed to export CSV');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'pending':
        return <AlertTriangle className="text-amber-600" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-600" size={20} />;
      default:
        return null;
    }
  };

  const getDiagnosisBadge = (diagnosis: string) => {
    if (diagnosis.includes('Clinical')) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">Clinical</span>;
    } else if (diagnosis.includes('Borderline')) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">Borderline</span>;
    } else if (diagnosis.includes('Non-ADHD')) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Non-Clinical</span>;
    } else {
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">{diagnosis}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assessment Results</h1>
          <p className="text-gray-600 mt-1">View and export questionnaire results</p>
        </div>
        {/* <Button onClick={handleExportCSV} variant="outline" className="gap-2 bg-transparent">
          <FileDown size={20} />
          Export CSV
        </Button> */}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <Input
                placeholder="Search by patient or questionnaire..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Results</p>
                <p className="text-2xl font-bold text-gray-900">{results.length}</p>
              </div>
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {results.filter((r) => r.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  {results.filter((r) => r.status === 'pending').length}
                </p>
              </div>
              <AlertTriangle className="text-amber-600" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clinical Cases</p>
                <p className="text-2xl font-bold text-red-600">
                  {results.filter((r) => r.diagnosis.includes('Clinical')).length}
                </p>
              </div>
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Results ({filteredResults.length})</CardTitle>
          <CardDescription>Complete assessment results</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-600">
              Loading results...
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              {searchTerm ? 'No results found matching your search' : 'No results yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Patient</TableHead>
                    <TableHead className="font-semibold">Questionnaire</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Percentile</TableHead>
                    <TableHead className="font-semibold">Diagnosis</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow key={result.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{result.patientName}</TableCell>
                      <TableCell className="text-sm">{result.questionnaireName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <span className="capitalize text-sm">{result.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {result.status === 'completed' ? (
                          <span className="font-semibold">{result.percentile}°</span>
                        ) : (
                          <span className="text-gray-400">–</span>
                        )}
                      </TableCell>
                      <TableCell>{getDiagnosisBadge(result.diagnosis)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {result.completedAt || '–'}
                      </TableCell>
                      <TableCell className="text-right">
                        {result.status === 'completed' && (
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              // onClick={() => handleExportWord(result.id)}
                            >
                              <FileText size={16} />
                              Word
                            </Button>
                            <Link href={`/admin/dashboard/results/${result.id}`}>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </Link>
                          </div>
                        )}
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
  );
}
