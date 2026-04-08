import { prisma } from '@/lib/db/prisma';
import { normalizeUrl } from '@/lib/url/normalize';
import { fetchSite } from '@/lib/crawler/fetchSite';
import { detectPlatform } from '@/lib/detectors/platformDetector';
import { detectSquarespace70Template, detectSquarespaceVersion } from '@/lib/detectors/squarespaceDetector';
import { extractFeatures } from './featureExtraction';
import { recommendTemplate } from '@/lib/recommendation/recommendationEngine';

export async function createOrReuseAnalysis(inputUrl: string) {
  const normalizedUrl = await normalizeUrl(inputUrl);
  const cacheHours = Number(process.env.ANALYSIS_CACHE_HOURS || 24);
  const cutoff = new Date(Date.now() - cacheHours * 60 * 60 * 1000);

  const existing = await prisma.analysisJob.findFirst({
    where: { normalizedUrl, status: 'completed', updatedAt: { gte: cutoff } },
    orderBy: { updatedAt: 'desc' }
  });

  if (existing) {
    return { job: existing, reused: true };
  }

  const job = await prisma.analysisJob.create({
    data: {
      inputUrl,
      normalizedUrl,
      status: 'queued'
    }
  });

  return { job, reused: false };
}

export async function processAnalysis(jobId: string) {
  const job = await prisma.analysisJob.findUnique({ where: { id: jobId } });
  if (!job) return;

  await prisma.analysisJob.update({ where: { id: jobId }, data: { status: 'running' } });

  try {
    const crawl = await fetchSite(job.normalizedUrl);
    const platform = detectPlatform(crawl.pages);
    const features = extractFeatures(crawl.pages);

    let squarespaceVersion: string | null = null;
    let detectedFamily: string | null = null;
    let detectedTemplateId: string | null = null;
    let detectedConfidence: number | null = null;
    let closestMatchTemplateId: string | null = null;
    let closestMatchConfidence: number | null = null;

    if (platform.platform === 'Squarespace') {
      const sq = detectSquarespaceVersion(crawl.pages);
      squarespaceVersion = sq.version;

      if (sq.version === '7.0') {
        const found = detectSquarespace70Template(crawl.pages);
        detectedFamily = found.family;
        detectedConfidence = found.confidence;
        const detected = await prisma.template.findFirst({ where: { name: found.template } });
        detectedTemplateId = detected?.id || null;
      } else {
        const candidates = await prisma.template.findMany({ where: { version: 'v7_1' } });
        const closest = candidates[0];
        closestMatchTemplateId = closest?.id || null;
        closestMatchConfidence = 74;
      }
    }

    const templates = await prisma.template.findMany();
    const recommendation = recommendTemplate(templates, features);

    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        platform: platform.platform,
        platformConfidence: platform.confidence,
        isSquarespace: platform.platform === 'Squarespace',
        squarespaceVersion,
        detectedFamily,
        detectedTemplateId,
        detectedConfidence,
        closestMatchTemplateId,
        closestMatchConfidence,
        recommendedTemplateId: recommendation.recommendedTemplate?.id,
        recommendedConfidence: recommendation.confidence,
        reasonSummary: recommendation.reasons.join(' '),
        rawSignalsJson: {
          platformSignals: platform.rawSignals,
          platformReasons: platform.reasons,
          features,
          recommendationAlternatives: recommendation.alternatives,
          honestyNote: platform.platform === 'Squarespace' && (detectedConfidence || closestMatchConfidence || 0) < 70
            ? 'We found signs of Squarespace, but the site uses heavy custom styling, so the original template is uncertain. We still selected the best rebuild recommendation based on layout and visual structure.'
            : null
        },
        screenshotUrl: crawl.screenshotBase64 ? `data:image/jpeg;base64,${crawl.screenshotBase64}` : null
      }
    });
  } catch (error) {
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { status: 'failed', errorMessage: error instanceof Error ? error.message : 'Unknown analysis error' }
    });
  }
}
