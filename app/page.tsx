// 'use client';

// import React from "react"

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// // import { apiClient } from '@/lib/api-client';
// // import type { AuthToken } from '@/types';

// export default function AdminLogin() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string>('');

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     try {
//       const response = await apiClient.post<AuthToken>('/api/auth/login/', {
//         email,
//         password,
//       });

//       // Store tokens
//       localStorage.setItem('accessToken', response.access);
//       localStorage.setItem('refreshToken', response.refresh);
      
//       // Set auth token for API client
//       apiClient.setAuthToken(response.access);

//       // Redirect to dashboard
//       router.push('/admin/dashboard');
//     } catch (err: any) {
//       setError(
//         err?.message || 'Invalid email or password. Please try again.',
//       );
//       console.error('Login error:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             Clinician Login
//           </h1>
//           <p className="text-gray-600">
//             Access the NeuroPsych Platform Dashboard
//           </p>
//         </div>

//         <Card className="border-0 shadow-lg">
//           <CardHeader>
//             <CardTitle>Sign In</CardTitle>
//             <CardDescription>
//               Enter your credentials to access the clinician dashboard
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleLogin} className="space-y-4">
//               {error && (
//                 <Alert variant="destructive">
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}

//               <div className="space-y-2">
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                   Email Address
//                 </label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="you@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   disabled={isLoading}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                   Password
//                 </label>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   disabled={isLoading}
//                   required
//                 />
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full"
//                 disabled={isLoading}
//               >
//                 {isLoading ? 'Signing in...' : 'Sign In'}
//               </Button>
//             </form>

//             <div className="mt-6 pt-6 border-t">
//               <p className="text-sm text-gray-600 text-center mb-4">
//                 Don't have an account?{' '}
//                 <Link
//                   href="/admin/register"
//                   className="text-blue-600 hover:text-blue-700 font-semibold"
//                 >
//                   Register here
//                 </Link>
//               </p>
//             </div>

//             <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-gray-600">
//               <p className="font-semibold text-gray-700 mb-2">Demo Credentials:</p>
//               <p>Email: dr.smith@clinic.com</p>
//               <p>Password: (will be set during registration)</p>
//             </div>
//           </CardContent>
//         </Card>

//         <div className="text-center mt-6">
//           <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
//             ← Back to Home
//           </Link>
//         </div>
//       </div>
//     </main>
//   );
// }



'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

type LoginResponse = {
  access?: string;
  refresh?: string;
  token?: string; // fallback if backend returns single token
  detail?: string;
  message?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://10.0.30.73:8000'; // change if needed

/**
 * =========================
 * DEV AUTH BYPASS (TEMP)
 * =========================
 * Purpose: While development is ongoing, allow login without backend auth.
 * Safety guards:
 *  - Works ONLY when NODE_ENV !== 'production'
 *  - Requires NEXT_PUBLIC_DEV_BYPASS_AUTH=true
 *  - Optional host allowlist via NEXT_PUBLIC_DEV_BYPASS_HOSTS
 *
 * How to enable (dev only) in .env.local:
 *   NEXT_PUBLIC_DEV_BYPASS_AUTH=true
 *   NEXT_PUBLIC_DEV_BYPASS_HOSTS=localhost,127.0.0.1,10.0.30.73
 *
 * How to disable later:
 *   - remove NEXT_PUBLIC_DEV_BYPASS_AUTH or set it to false
 *   - (and/or) delete the bypass block inside handleLogin()
 */
const DEV_BYPASS_ENABLED =
  process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true' &&
  process.env.NODE_ENV !== 'production';

const isHostAllowedForBypass = () => {
  if (typeof window === 'undefined') return false;

  const raw = process.env.NEXT_PUBLIC_DEV_BYPASS_HOSTS || '';
  // If you don't set hosts, default to allowing localhost only (safer)
  const allowedHosts = raw
    ? raw.split(',').map((s) => s.trim()).filter(Boolean)
    : ['localhost', '127.0.0.1'];

  return allowedHosts.includes(window.location.hostname);
};

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      /**
       * =========================
       * BYPASS LOGIN (TEMP)
       * =========================
       * Accept ANY email/password and instantly "login"
       * ONLY in dev environment + when bypass enabled + host allowed.
       *
       * Remove this whole block when production auth is ready.
       */
      if (DEV_BYPASS_ENABLED && isHostAllowedForBypass()) {
        localStorage.setItem('accessToken', 'dev-bypass-access-token');
        localStorage.setItem('refreshToken', 'dev-bypass-refresh-token');

        // redirect
        router.push('/admin/dashboard/patients');
        return;
      }

      // REAL BACKEND LOGIN (production-ready path)
      const res = await fetch(`${API_BASE}/api/v1/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // If your backend uses cookies/session, enable this:
        // credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.detail ||
          data?.message ||
          'Invalid email or password. Please try again.';
        throw new Error(msg);
      }

      // Token handling (JWT pair or single token)
      if (data.access) localStorage.setItem('accessToken', data.access);
      if (data.refresh) localStorage.setItem('refreshToken', data.refresh);
      if (!data.access && data.token) localStorage.setItem('accessToken', data.token);

      // redirect
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
          <Link href="/admin/dashboard/patients" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
