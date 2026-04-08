import { Template } from '@prisma/client';
import { ExtractedFeatures } from '@/lib/analysis/featureExtraction';

export function recommendTemplate(templates: Template[], features: ExtractedFeatures) {
  const recommendable = templates.filter((t) => t.isRecommended && t.isCurrent);

  const scored = recommendable.map((t) => {
    const score =
      overlap(t.industryTags, features.siteCategory) * 30 +
      overlap(t.styleTags, features.visual) * 25 +
      overlap(t.layoutTags, features.layout) * 25 +
      20;
    return { template: t, score: Math.min(98, score) };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0];
  const alternatives = scored.slice(1, 4).map((s) => ({ name: s.template.name, slug: s.template.slug, confidence: s.score }));

  return {
    recommendedTemplate: top?.template,
    confidence: top?.score || 55,
    reasons: [`Recommended because the site uses ${features.visual.join(', ')}, ${features.layout[0]}, and ${features.siteCategory[0] || 'service business'} structure.`],
    alternatives
  };
}

function overlap(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b.map((x) => x.toLowerCase()));
  return a.filter((x) => setB.has(x.toLowerCase())).length;
}
