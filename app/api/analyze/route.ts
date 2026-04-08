import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeInputSchema } from '@/lib/url/normalize';
import { checkRateLimit } from '@/lib/utils/rateLimit';
import { createOrReuseAnalysis, processAnalysis } from '@/lib/analysis/runAnalysis';
import { runJob } from '@/lib/analysis/queue';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (!checkRateLimit(ip)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const payload = await req.json();
  const parsed = AnalyzeInputSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid URL input' }, { status: 400 });

  const { job, reused } = await createOrReuseAnalysis(parsed.data.url);
  if (!reused) {
    void runJob(job.id, async () => {
      await processAnalysis(job.id);
    });
  }

  return NextResponse.json({ id: job.id, status: reused ? 'completed' : 'queued', reused });
}
