import { AnalyzeForm } from '@/components/forms/AnalyzeForm';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold md:text-6xl">Squarespace Template Finder</h1>
      <p className="mt-4 max-w-3xl text-slate-300">
        Paste any website URL. We detect the platform, detect Squarespace version, estimate template match honestly, and recommend the best template to rebuild a similar site.
      </p>

      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <AnalyzeForm />
        <p className="mt-3 text-xs text-slate-400">We use explainable signals and show uncertainty when confidence is low.</p>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <Card title="7.0 wording">Likely template family + likely detected template + separate recommendation.</Card>
        <Card title="7.1 wording">Closest template match + separate recommendation.</Card>
        <Card title="Recommendation engine">Maps layout, content rhythm, and style traits to current templates.</Card>
      </section>

      <footer className="mt-16 border-t border-slate-800 pt-6 text-sm text-slate-400">Built for honest, practical template matching.</footer>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-300">{children}</p>
    </div>
  );
}
