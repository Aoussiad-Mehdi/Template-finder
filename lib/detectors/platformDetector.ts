import { CrawledPage } from '@/lib/crawler/fetchSite';

export type Signal = { name: string; platform: string; weight: number; reason: string };

const platformPatterns: Array<{ platform: string; name: string; weight: number; test: (text: string) => boolean }> = [
  { platform: 'Squarespace', name: 'squarespace-cdn', weight: 40, test: (t) => /static1\.squarespace\.com|squarespace\.com\/(template|config)/i.test(t) },
  { platform: 'WordPress', name: 'wp-content', weight: 35, test: (t) => /wp-content|wp-includes|wordpress/i.test(t) },
  { platform: 'Shopify', name: 'shopify-cdn', weight: 40, test: (t) => /cdn\.shopify\.com|shopify\.theme/i.test(t) },
  { platform: 'Webflow', name: 'webflow', weight: 40, test: (t) => /webflow\.js|data-wf-page|webflow\.com/i.test(t) },
  { platform: 'Wix', name: 'wix', weight: 40, test: (t) => /wixstatic\.com|wix-code|wix\.com/i.test(t) },
  { platform: 'Framer', name: 'framer', weight: 40, test: (t) => /framer\.com|framerusercontent/i.test(t) }
];

export function detectPlatform(pages: CrawledPage[]) {
  const text = pages.map((p) => `${p.rawHtml}\n${p.renderedHtml}`).join('\n');
  const scores = new Map<string, number>();
  const signals: Signal[] = [];

  for (const pattern of platformPatterns) {
    if (pattern.test(text)) {
      scores.set(pattern.platform, (scores.get(pattern.platform) || 0) + pattern.weight);
      signals.push({ name: pattern.name, platform: pattern.platform, weight: pattern.weight, reason: `${pattern.name} matched` });
    }
  }

  if (scores.size === 0) {
    return { platform: 'Unknown', confidence: 35, reasons: ['No strong platform markers detected'], rawSignals: [] as Signal[] };
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const [platform, rawScore] = ranked[0];
  const confidence = Math.min(99, Math.max(45, rawScore + 35));
  return {
    platform,
    confidence,
    reasons: signals.filter((s) => s.platform === platform).map((s) => s.reason).slice(0, 4),
    rawSignals: signals
  };
}
