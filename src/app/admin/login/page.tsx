'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music2, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('Email atau password salah!');
      setLoading(false);
    } else {
      router.push('/admin/matrix');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-[#0A192F] rounded-xl shadow-md mb-2">
            <Music2 className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0A192F]">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">NDC Music Ministry Management</p>
        </div>

        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle as="h2" className="text-lg font-semibold text-[#0A192F] flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#D4AF37]" />
              Masuk Akun Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg text-sm mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Admin
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ndc.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0A192F] text-[#D4AF37] font-semibold py-2.5 rounded-lg hover:bg-[#112240] transition duration-200 disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Memproses...' : 'Masuk Dashboard'}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}