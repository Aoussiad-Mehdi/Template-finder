import { CrawledPage } from '@/lib/crawler/fetchSite';

export type ExtractedFeatures = {
  siteCategory: string[];
  layout: string[];
  visual: string[];
  content: string[];
  technical: string[];
};

export function extractFeatures(pages: CrawledPage[]): ExtractedFeatures {
  const text = pages.map((p) => `${p.rawHtml}\n${p.renderedHtml}\n${p.headings.join(' ')}`).join('\n').toLowerCase();

  const content = [
    text.includes('shop') || text.includes('product') ? 'store presence' : '',
    text.includes('blog') ? 'blog presence' : '',
    text.includes('portfolio') || text.includes('project') ? 'portfolio presence' : '',
    text.includes('book') || text.includes('appointment') ? 'booking presence' : ''
  ].filter(Boolean);

  const layout = [
    text.includes('sticky') ? 'sticky header' : 'standard header',
    text.includes('grid') ? 'grid density medium' : 'grid density low',
    text.includes('hero') ? 'hero height large' : 'hero height compact'
  ];

  const visual = [
    text.includes('minimal') ? 'minimal' : 'clean',
    text.includes('editorial') ? 'editorial' : 'image first'
  ];

  const siteCategory = [
    content.includes('store presence') ? 'ecommerce' : '',
    content.includes('portfolio presence') ? 'portfolio' : '',
    content.includes('blog presence') ? 'blog' : '',
    !content.length ? 'service business' : ''
  ].filter(Boolean);

  const technical = ['DOM markers', 'class patterns', 'script patterns'];

  return { siteCategory, layout, visual, content, technical };
}
