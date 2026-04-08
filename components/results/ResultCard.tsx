import Link from 'next/link';
import Image from 'next/image';
import { confidenceLabel } from '@/lib/utils/confidence';

export function ResultCard({ data }: { data: any }) {
  const { job, detectedTemplate, closestMatchTemplate, recommendedTemplate, affiliateLink } = data;
  const confidence = job.platform === 'Squarespace'
    ? (job.squarespaceVersion === '7.0' ? (job.detectedConfidence ?? job.platformConfidence) : (job.closestMatchConfidence ?? job.platformConfidence))
    : job.platformConfidence;

  return (
    <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <section>
        <p className="text-sm text-slate-400">URL analyzed</p>
        <p className="font-medium">{job.normalizedUrl}</p>
        <p className="mt-2">Built with: <strong>{job.platform || 'Unknown'}</strong></p>
        {job.isSquarespace && <p>Version: <strong>{job.squarespaceVersion}</strong></p>}
        <p>Confidence: <strong>{confidence}% ({confidenceLabel(confidence || 0)})</strong></p>
      </section>

      <section>
        {job.squarespaceVersion === '7.0' ? (
          <>
            <p>Likely template family: <strong>{job.detectedFamily || 'Uncertain'}</strong></p>
            <p>Likely detected template: <strong>{detectedTemplate?.name || 'Uncertain'}</strong></p>
          </>
        ) : job.squarespaceVersion === '7.1' ? (
          <p>Closest template match: <strong>{closestMatchTemplate?.name || 'Uncertain'}</strong></p>
        ) : null}
        <p className="mt-2">Recommended template to rebuild a similar site: <strong>{recommendedTemplate?.name || 'Unavailable'}</strong></p>
      </section>

      {recommendedTemplate?.previewImageUrl && (
        <section className="space-y-3">
          <Image src={recommendedTemplate.previewImageUrl} alt={recommendedTemplate.name} width={1100} height={600} className="h-auto w-full rounded-xl" />
          {affiliateLink && (
            <Link href={affiliateLink} target="_blank" className="inline-block rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-slate-900">
              View recommended template
            </Link>
          )}
        </section>
      )}

      <section>
        <h3 className="font-semibold">Why this match fits</h3>
        <p className="text-slate-300">{job.reasonSummary || 'Signals are limited. Recommendation is based on available structure and style markers.'}</p>
      </section>

      <details className="rounded-lg border border-slate-800 p-3">
        <summary className="cursor-pointer">Raw signals (debug)</summary>
        <pre className="mt-3 overflow-auto text-xs">{JSON.stringify(job.rawSignalsJson, null, 2)}</pre>
      </details>
    </div>
  );
}
