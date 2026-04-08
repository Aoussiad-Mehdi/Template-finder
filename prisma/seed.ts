import { PrismaClient, TemplateStatus, TemplateVersion } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.affiliateConfig.upsert({
    where: { id: 'default-affiliate-config' },
    update: {},
    create: {
      id: 'default-affiliate-config',
      baseAffiliateUrl: process.env.AFFILIATE_BASE_URL || 'https://squarespace.syuh.net/Kj69Jv',
      deepLinkMode: (process.env.AFFILIATE_DEEP_LINK_MODE as 'path' | 'query') || 'query',
      enabled: true
    }
  });

  const templates = [
    { name: 'Paloma', slug: 'paloma', version: TemplateVersion.v7_1, family: '7.1', status: TemplateStatus.current, isCurrent: true, isRecommended: true, industryTags: ['portfolio','agency'], styleTags: ['editorial','minimal'], layoutTags: ['grid','image-first'] },
    { name: 'Quinn', slug: 'quinn', version: TemplateVersion.v7_1, family: '7.1', status: TemplateStatus.current, isCurrent: true, isRecommended: true, industryTags: ['services','business'], styleTags: ['clean','minimal'], layoutTags: ['split-sections','cta'] },
    { name: 'Hester', slug: 'hester', version: TemplateVersion.v7_1, family: '7.1', status: TemplateStatus.current, isCurrent: true, isRecommended: true, industryTags: ['store','ecommerce'], styleTags: ['bold'], layoutTags: ['product-grid'] },
    { name: 'Rally', slug: 'rally', version: TemplateVersion.v7_0, family: 'Brine', status: TemplateStatus.legacy, isCurrent: false, isRecommended: false, industryTags: ['business'], styleTags: ['clean'], layoutTags: ['sidebar'] },
    { name: 'Mojave', slug: 'mojave', version: TemplateVersion.v7_0, family: 'Brine', status: TemplateStatus.legacy, isCurrent: false, isRecommended: false, industryTags: ['portfolio'], styleTags: ['image-first'], layoutTags: ['grid'] }
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: {
        ...t,
        officialUrl: `https://www.squarespace.com/templates/${t.slug}`,
        previewImageUrl: `https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1200&q=80`,
        description: `${t.name} starter profile`
      },
      create: {
        ...t,
        officialUrl: `https://www.squarespace.com/templates/${t.slug}`,
        previewImageUrl: `https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1200&q=80`,
        description: `${t.name} starter profile`
      }
    });
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
