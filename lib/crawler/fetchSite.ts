import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

export type CrawledPage = {
  url: string;
  rawHtml: string;
  renderedHtml: string;
  headings: string[];
  links: string[];
};

export type CrawlResult = {
  pages: CrawledPage[];
  screenshotBase64?: string;
};

const interestingPaths = ['about', 'services', 'shop', 'blog', 'portfolio', 'contact'];

export async function fetchSite(normalizedUrl: string): Promise<CrawlResult> {
  const timeout = Number(process.env.PLAYWRIGHT_TIMEOUT_MS || 15000);
  const homeRaw = await fetchRaw(normalizedUrl, timeout);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(normalizedUrl, { waitUntil: 'domcontentloaded', timeout });
  const renderedHtml = await page.content();
  const screenshotBase64 = await page.screenshot({ type: 'jpeg', quality: 70 }).then((b) => b.toString('base64')).catch(() => undefined);
  const links = await page.$$eval('a[href]', (nodes) => nodes.map((n) => (n as HTMLAnchorElement).href));

  const candidateLinks = dedupe(
    links.filter((href) => {
      try {
        const u = new URL(href);
        const base = new URL(normalizedUrl);
        return u.hostname === base.hostname && interestingPaths.some((p) => u.pathname.toLowerCase().includes(p));
      } catch {
        return false;
      }
    })
  ).slice(0, 4);

  const pages: CrawledPage[] = [extractPage(normalizedUrl, homeRaw, renderedHtml, links)];

  for (const internalUrl of candidateLinks) {
    const raw = await fetchRaw(internalUrl, timeout).catch(() => '');
    await page.goto(internalUrl, { waitUntil: 'domcontentloaded', timeout }).catch(() => null);
    const html = await page.content().catch(() => '');
    const pageLinks = await page.$$eval('a[href]', (nodes) => nodes.map((n) => (n as HTMLAnchorElement).href)).catch(() => [] as string[]);
    pages.push(extractPage(internalUrl, raw, html, pageLinks));
  }

  await browser.close();

  return { pages, screenshotBase64 };
}

async function fetchRaw(url: string, timeout: number): Promise<string> {
  const controller = new AbortController();
  const handle = setTimeout(() => controller.abort(), timeout);
  const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
  clearTimeout(handle);
  return await res.text();
}

function extractPage(url: string, rawHtml: string, renderedHtml: string, links: string[]): CrawledPage {
  const $ = cheerio.load(renderedHtml || rawHtml || '');
  const headings = $('h1,h2,h3')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);

  return { url, rawHtml, renderedHtml, headings, links: dedupe(links) };
}

function dedupe<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
