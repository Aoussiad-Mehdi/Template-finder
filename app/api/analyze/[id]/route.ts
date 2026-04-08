import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { buildAffiliateLink } from '@/lib/affiliate/buildAffiliateLink';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.analysisJob.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [detectedTemplate, closestMatchTemplate, recommendedTemplate] = await Promise.all([
    job.detectedTemplateId ? prisma.template.findUnique({ where: { id: job.detectedTemplateId } }) : null,
    job.closestMatchTemplateId ? prisma.template.findUnique({ where: { id: job.closestMatchTemplateId } }) : null,
    job.recommendedTemplateId ? prisma.template.findUnique({ where: { id: job.recommendedTemplateId } }) : null
  ]);

  const affiliateLink = recommendedTemplate ? await buildAffiliateLink(recommendedTemplate.slug) : null;

  return NextResponse.json({ job, detectedTemplate, closestMatchTemplate, recommendedTemplate, affiliateLink });
}
