import { CrawledPage } from '@/lib/crawler/fetchSite';

export function detectSquarespaceVersion(pages: CrawledPage[]) {
  const text = pages.map((p) => `${p.rawHtml}\n${p.renderedHtml}`).join('\n');
  const score70 = score(text, [/templateId/i, /sqs-layout/i, /sqs-block/i, /brine/i], [20, 20, 15, 25]);
  const score71 = score(text, [/data-section-id/i, /sections-engine/i, /tweak-global-animations/i, /sqs-site-container/i], [25, 25, 20, 20]);

  const isSquarespace = score70 > 30 || score71 > 30 || /squarespace/i.test(text);
  const version = score71 >= score70 ? '7.1' : '7.0';
  const confidence = Math.min(98, Math.max(50, Math.max(score70, score71) + 40));

  return {
    isSquarespace,
    version,
    confidence,
    reasons: [
      score71 >= score70 ? 'Section-based markup and modern Squarespace markers found.' : 'Legacy block/layout markers align with Squarespace 7.0.'
    ]
  };
}

function score(text: string, patterns: RegExp[], weights: number[]): number {
  return patterns.reduce((sum, p, i) => sum + (p.test(text) ? weights[i] : 0), 0);
}

export function detectSquarespace70Template(pages: CrawledPage[]) {
  const text = pages.map((p) => `${p.rawHtml}\n${p.renderedHtml}`).join('\n').toLowerCase();
  const family = text.includes('brine') || text.includes('sqs-style-family-brine') ? 'Brine' : 'Five';
  const template = text.includes('rally') ? 'Rally' : family === 'Brine' ? 'Mojave' : 'Bedford';
  const confidence = text.includes('templateid') ? 82 : 66;
  return {
    family,
    template,
    confidence,
    reasons: [`Layout and class conventions align with ${family} family traits.`]
  };
}
