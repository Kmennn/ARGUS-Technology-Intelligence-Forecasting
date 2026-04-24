'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/overview';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password.');
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--background)' }}
    >
      <div
        className="w-full max-w-md rounded-lg p-8"
        style={{
          background: 'var(--background-muted)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h1
            className="text-3xl font-bold"
            style={{ color: 'var(--ink-primary)', fontFamily: 'var(--font-serif, Georgia, serif)' }}
          >
            ARGUS
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--ink-secondary)' }}>
            Authorized access only. Enter your credentials to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-widest mb-2"
              style={{ color: 'var(--ink-tertiary)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded px-3 py-2.5 text-sm focus:outline-none"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                color: 'var(--ink-primary)',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-widest mb-2"
              style={{ color: 'var(--ink-tertiary)' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded px-3 py-2.5 text-sm focus:outline-none"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                color: 'var(--ink-primary)',
              }}
            />
          </div>

          {error && (
            <div
              className="text-sm px-3 py-2 rounded"
              style={{ color: 'var(--accent)', background: 'var(--background)', border: '1px solid var(--border)' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded text-sm font-semibold uppercase tracking-widest transition-opacity"
            style={{
              background: 'var(--accent)',
              color: '#FEF9ED',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-xs text-center" style={{ color: 'var(--ink-muted)' }}>
          Access is limited to credentialed reviewers. Contact the administrator for provisioning.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginForm />
    </Suspense>
  );
}
