import { z } from 'zod';
import dns from 'node:dns/promises';
import net from 'node:net';

export const AnalyzeInputSchema = z.object({
  url: z.string().url().or(z.string().regex(/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i))
});

const blockedRanges = [/^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[0-1])\./, /^0\./, /^169\.254\./, /^::1$/, /^fc/i, /^fd/i];

export async function normalizeUrl(input: string): Promise<string> {
  const ensured = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const parsed = new URL(ensured);
  parsed.hash = '';
  ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'].forEach((k) => parsed.searchParams.delete(k));
  if (parsed.pathname.endsWith('/')) parsed.pathname = parsed.pathname.slice(0, -1) || '/';
  await ensureSafeHost(parsed.hostname);
  return parsed.toString();
}

async function ensureSafeHost(hostname: string): Promise<void> {
  if (hostname === 'localhost' || hostname.endsWith('.local')) throw new Error('Blocked hostname');
  if (net.isIP(hostname)) {
    if (blockedRanges.some((r) => r.test(hostname))) throw new Error('Blocked private IP');
    return;
  }
  const records = await dns.lookup(hostname, { all: true });
  for (const record of records) {
    if (blockedRanges.some((r) => r.test(record.address))) throw new Error('Blocked resolved private IP');
  }
}
