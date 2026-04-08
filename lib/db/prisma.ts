import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';

const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/template_finder';
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
}

const globalForPrisma = globalThis as unknown as {
  prismaClient: PrismaClient | undefined;
  prismaMemoryMode: boolean | undefined;
};

const prismaClient = globalForPrisma.prismaClient ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaClient = prismaClient;

let memoryMode = globalForPrisma.prismaMemoryMode ?? false;
const now = () => new Date();

const memory = {
  analysisJobs: [] as any[],
  templates: [
    {
      id: `tpl_${randomUUID()}`,
      createdAt: now(),
      updatedAt: now(),
      name: 'Paloma',
      slug: 'paloma',
      version: 'v7_1',
      family: '7.1',
      officialUrl: 'https://www.squarespace.com/templates/paloma',
      previewImageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1200&q=80',
      status: 'current',
      industryTags: ['portfolio', 'agency'],
      styleTags: ['editorial', 'minimal'],
      layoutTags: ['grid', 'image-first'],
      description: 'Paloma starter profile',
      isCurrent: true,
      isRecommended: true,
      sortOrder: 1
    },
    {
      id: `tpl_${randomUUID()}`,
      createdAt: now(),
      updatedAt: now(),
      name: 'Quinn',
      slug: 'quinn',
      version: 'v7_1',
      family: '7.1',
      officialUrl: 'https://www.squarespace.com/templates/quinn',
      previewImageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1200&q=80',
      status: 'current',
      industryTags: ['services', 'business'],
      styleTags: ['clean', 'minimal'],
      layoutTags: ['split-sections', 'cta'],
      description: 'Quinn starter profile',
      isCurrent: true,
      isRecommended: true,
      sortOrder: 2
    },
    {
      id: `tpl_${randomUUID()}`,
      createdAt: now(),
      updatedAt: now(),
      name: 'Rally',
      slug: 'rally',
      version: 'v7_0',
      family: 'Brine',
      officialUrl: 'https://www.squarespace.com/templates/rally',
      previewImageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1200&q=80',
      status: 'legacy',
      industryTags: ['business'],
      styleTags: ['clean'],
      layoutTags: ['sidebar'],
      description: 'Rally starter profile',
      isCurrent: false,
      isRecommended: false,
      sortOrder: 3
    }
  ],
  affiliateConfig: {
    id: 'default-affiliate-config',
    createdAt: now(),
    updatedAt: now(),
    baseAffiliateUrl: process.env.AFFILIATE_BASE_URL || 'https://squarespace.syuh.net/Kj69Jv',
    deepLinkMode: process.env.AFFILIATE_DEEP_LINK_MODE || 'query',
    enabled: true
  }
};

function isConnectionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /Can't reach database server|Environment variable not found|P1001|connect ECONNREFUSED/i.test(message);
}

async function withFallback<T>(dbCall: () => Promise<T>, memCall: () => T | Promise<T>): Promise<T> {
  if (memoryMode) return await memCall();
  try {
    return await dbCall();
  } catch (error) {
    if (!isConnectionError(error)) throw error;
    memoryMode = true;
    globalForPrisma.prismaMemoryMode = true;
    return await memCall();
  }
}

export const prisma = {
  analysisJob: {
    findFirst: (args: any) => withFallback(
      () => prismaClient.analysisJob.findFirst(args),
      () => memory.analysisJobs
        .filter((j) => (args?.where?.normalizedUrl ? j.normalizedUrl === args.where.normalizedUrl : true))
        .filter((j) => (args?.where?.status ? j.status === args.where.status : true))
        .filter((j) => (args?.where?.updatedAt?.gte ? j.updatedAt >= args.where.updatedAt.gte : true))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0] || null
    ),
    create: (args: any) => withFallback(
      () => prismaClient.analysisJob.create(args),
      () => {
        const job = { id: `job_${randomUUID()}`, createdAt: now(), updatedAt: now(), ...args.data };
        memory.analysisJobs.push(job);
        return job;
      }
    ),
    findUnique: (args: any) => withFallback(
      () => prismaClient.analysisJob.findUnique(args),
      () => memory.analysisJobs.find((j) => j.id === args.where.id) || null
    ),
    update: (args: any) => withFallback(
      () => prismaClient.analysisJob.update(args),
      () => {
        const idx = memory.analysisJobs.findIndex((j) => j.id === args.where.id);
        if (idx < 0) throw new Error('Job not found');
        memory.analysisJobs[idx] = { ...memory.analysisJobs[idx], ...args.data, updatedAt: now() };
        return memory.analysisJobs[idx];
      }
    ),
    findMany: (args: any) => withFallback(
      () => prismaClient.analysisJob.findMany(args),
      () => {
        const list = [...memory.analysisJobs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return args?.take ? list.slice(0, args.take) : list;
      }
    )
  },
  template: {
    findMany: (args?: any) => withFallback(
      () => prismaClient.template.findMany(args),
      () => {
        let out = [...memory.templates];
        if (args?.where?.version) out = out.filter((t) => t.version === args.where.version);
        if (args?.orderBy) out = out.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        return out;
      }
    ),
    findFirst: (args: any) => withFallback(
      () => prismaClient.template.findFirst(args),
      () => memory.templates.find((t) => (args?.where?.name ? t.name === args.where.name : true)) || null
    ),
    findUnique: (args: any) => withFallback(
      () => prismaClient.template.findUnique(args),
      () => memory.templates.find((t) => (args.where.id ? t.id === args.where.id : t.slug === args.where.slug)) || null
    ),
    update: (args: any) => withFallback(
      () => prismaClient.template.update(args),
      () => {
        const idx = memory.templates.findIndex((t) => t.id === args.where.id);
        if (idx < 0) throw new Error('Template not found');
        memory.templates[idx] = { ...memory.templates[idx], ...args.data, updatedAt: now() };
        return memory.templates[idx];
      }
    ),
    create: (args: any) => withFallback(
      () => prismaClient.template.create(args),
      () => {
        const row = { id: `tpl_${randomUUID()}`, createdAt: now(), updatedAt: now(), sortOrder: 99, ...args.data };
        memory.templates.push(row);
        return row;
      }
    )
  },
  affiliateConfig: {
    findFirst: (args?: any) => withFallback(
      () => prismaClient.affiliateConfig.findFirst(args),
      () => memory.affiliateConfig
    ),
    upsert: (args: any) => withFallback(
      () => prismaClient.affiliateConfig.upsert(args),
      () => {
        memory.affiliateConfig = { ...memory.affiliateConfig, ...args.update, ...args.create, updatedAt: now() };
        return memory.affiliateConfig;
      }
    )
  }
};
