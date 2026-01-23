'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

type LoginResponse = {
  success?: boolean;
  status_code?: number;
  message?: string;
  detail?: string;

  // expected JWT pair (common)
  access?: string;
  refresh?: string;

  // fallback if backend returns a single token
  token?: string;

  // fallback if backend nests token data
  data?: {
    access?: string;
    refresh?: string;
    token?: string;
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://10.0.30.73:8000';

const formatError = (data: any) => {
  if (!data) return 'Login failed';
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  if (data.message) return data.message;

  // DRF field errors: {field: ["msg"]}
  const keys = Object.keys(data);
  if (keys.length) {
    const k = keys[0];
    const v = data[k];
    if (Array.isArray(v) && v.length) return `${k}: ${v[0]}`;
    if (typeof v === 'string') return `${k}: ${v}`;
  }
  return 'Login failed';
};



export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState(''); // you will pass this as "identifier"
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // ✅ REAL BACKEND LOGIN (expects: { identifier, password })
      const res = await fetch(`${API_BASE}/api/v1/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: email.trim(),
          password,
        }),
      });

      const data: LoginResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(formatError(data));
      }

      // Clear any old/mocked tokens
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Extract tokens (support multiple shapes)
      const access =
        data.access ?? data.data?.access ?? data.token ?? data.data?.token ?? '';
      const refresh = data.refresh ?? data.data?.refresh ?? '';

      if (!access) {
        throw new Error('Login succeeded but no access token was returned by the server.');
      }

      localStorage.setItem('accessToken', access);
      if (refresh) localStorage.setItem('refreshToken', refresh);

      router.push('/admin/dashboard/patients');
    } catch (err: any) {
      setError(err?.message || 'Login failed.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clinician Login</h1>
          <p className="text-gray-600">Access the NeuroPsych Platform Dashboard</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the clinician dashboard</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 text-center mb-4">
                Don&apos;t have an account?{' '}
                <Link href="/admin/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
