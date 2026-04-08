'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AnalyzeForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const rawBody = await res.text();
      let data: any = {};
      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        throw new Error('Server returned an invalid response. Please try again.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze URL');
      }

      router.push(`/results/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button disabled={loading} className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 disabled:opacity-60">
        {loading ? 'Analyzing…' : 'Analyze Website'}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
