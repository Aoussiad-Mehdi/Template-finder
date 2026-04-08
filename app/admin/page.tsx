import { prisma } from '@/lib/db/prisma';

export default async function AdminPage() {
  const templates = await prisma.template.findMany({ orderBy: { updatedAt: 'desc' } });
  const jobs = await prisma.analysisJob.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  const config = await prisma.affiliateConfig.findFirst({ orderBy: { updatedAt: 'desc' } });

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-12">
      <h1 className="text-3xl font-bold">Admin</h1>
      <p className="text-sm text-slate-400">Protected via x-admin-password header on write endpoints.</p>

      <section className="rounded-xl border border-slate-800 p-4">
        <h2 className="mb-2 font-semibold">Affiliate Config</h2>
        <p>Base URL: {config?.baseAffiliateUrl}</p>
        <p>Mode: {config?.deepLinkMode}</p>
      </section>

      <section className="rounded-xl border border-slate-800 p-4">
        <h2 className="mb-2 font-semibold">Template Library</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr><th>Name</th><th>Version</th><th>Family</th><th>Slug</th><th>Status</th></tr></thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="border-t border-slate-800">
                  <td>{t.name}</td><td>{t.version}</td><td>{t.family}</td><td>{t.slug}</td><td>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 p-4">
        <h2 className="mb-2 font-semibold">Analysis History</h2>
        <ul className="space-y-2 text-sm">
          {jobs.map((j) => <li key={j.id}>{j.inputUrl} — {j.status} — {j.platform || 'pending'}</li>)}
        </ul>
      </section>
    </main>
  );
}
