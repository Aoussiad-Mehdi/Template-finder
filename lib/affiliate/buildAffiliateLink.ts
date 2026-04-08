import { prisma } from '@/lib/db/prisma';
import { affiliateDefaults } from './config';

export async function buildAffiliateLink(templateSlug: string): Promise<string> {
  const config = await prisma.affiliateConfig.findFirst({ where: { enabled: true }, orderBy: { updatedAt: 'desc' } });
  const base = config?.baseAffiliateUrl || affiliateDefaults.baseAffiliateUrl;
  const mode = config?.deepLinkMode || affiliateDefaults.deepLinkMode;

  if (mode === 'path') {
    return `${base.replace(/\/$/, '')}/templates/${templateSlug}`;
  }

  return `${base}?u=${encodeURIComponent(`https://www.squarespace.com/templates/${templateSlug}`)}`;
}
