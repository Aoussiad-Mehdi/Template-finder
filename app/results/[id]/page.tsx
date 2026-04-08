import { ResultCard } from '@/components/results/ResultCard';

async function getData(id: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/analyze/${id}`, { cache: 'no-store' });
  return res.json();
}

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData(id);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">Analysis Result</h1>
      <ResultCard data={data} />
      <a className="mt-6 inline-block text-sm text-slate-300 underline" href="/">Analyze another site</a>
    </main>
  );
}
