'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, ClipboardList, CheckCircle, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalPatients: number;
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  recentActivity: Array<{
    id: number;
    title: string;
    timestamp: string;
    type: 'patient' | 'assignment' | 'result';
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // useEffect(() => {
  //   // Load dashboard stats from API
  //   const loadStats = async () => {
  //     try {
  //       const token = localStorage.getItem('accessToken');
  //       if (!token) {
  //         setError('Authentication required');
  //         return;
  //       }

  //       // For now, using mock data until backend is ready
  //       setStats({
  //         totalPatients: 24,
  //         totalAssignments: 48,
  //         completedAssignments: 32,
  //         pendingAssignments: 16,
  //         recentActivity: [
  //           {
  //             id: 1,
  //             title: 'Giovanni Rossi completed Barkley ADHD Scale',
  //             timestamp: '2 hours ago',
  //             type: 'result',
  //           },
  //           {
  //             id: 2,
  //             title: 'Maria Bianchi assigned 3 new questionnaires',
  //             timestamp: '4 hours ago',
  //             type: 'assignment',
  //           },
  //           {
  //             id: 3,
  //             title: 'New patient: Francesco Verdi registered',
  //             timestamp: '1 day ago',
  //             type: 'patient',
  //           },
  //         ],
  //       });
  //     } catch (err: any) {
  //       setError(err?.message || 'Failed to load dashboard data');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   loadStats();
  // }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalPatients || 0}</div>
            <p className="text-xs text-gray-600 mt-1">Active patients in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <ClipboardList className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalAssignments || 0}</div>
            <p className="text-xs text-gray-600 mt-1">Questionnaires assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.completedAssignments || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats && (
                `${Math.round((stats.completedAssignments / stats.totalAssignments) * 100)}% completion`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.pendingAssignments || 0}</div>
            <p className="text-xs text-gray-600 mt-1">Awaiting completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions in your clinic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'result'
                    ? 'bg-emerald-600'
                    : activity.type === 'assignment'
                      ? 'bg-blue-600'
                      : 'bg-purple-600'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Common actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Add Patient</h3>
              <p className="text-sm text-blue-700 mb-3">Register a new patient in the system</p>
              <a href="/admin/dashboard/patients" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Go to Patients →
              </a>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Assign Questionnaires</h3>
              <p className="text-sm text-green-700 mb-3">Assign assessments to your patients</p>
              <a href="/admin/dashboard/questionnaires" className="text-sm font-semibold text-green-600 hover:text-green-700">
                Go to Questionnaires →
              </a>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">View Results</h3>
              <p className="text-sm text-purple-700 mb-3">Review calculated assessment results</p>
              <a href="/admin/dashboard/results" className="text-sm font-semibold text-purple-600 hover:text-purple-700">
                Go to Results →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
