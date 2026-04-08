import { ResultCard } from '@/components/results/ResultCard';

async function getData(id: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${base}/api/analyze/${id}`, { cache: 'no-store' });
    const raw = await res.text();
    const data = raw ? JSON.parse(raw) : {};

    if (!res.ok) {
      return { error: data.error || 'Unable to load analysis result.' };
    }

    return data;
  } catch {
    return { error: 'Unable to load analysis result right now. Please refresh in a few seconds.' };
  }
}

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData(id);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">Analysis Result</h1>
      {data.error && (
        <p className="mb-4 rounded-lg border border-amber-700 bg-amber-950/40 p-3 text-amber-200">{data.error}</p>
      )}
      <ResultCard data={data} />
      <a className="mt-6 inline-block text-sm text-slate-300 underline" href="/">Analyze another site</a>
    </main>
  );
}
