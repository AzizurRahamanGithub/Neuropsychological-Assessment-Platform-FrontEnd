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
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://10.0.30.18:8013'; // change if needed

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
      const res = await fetch(`${API_BASE}/api/v1/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // If your backend uses cookies/session, enable this:
        // credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Try to show meaningful backend errors
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
      router.push('/admin/dashboard');
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
