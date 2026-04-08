import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { isAdminAuthorized } from '@/lib/utils/adminAuth';

const TemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  version: z.enum(['v7_0', 'v7_1']),
  family: z.string().optional(),
  officialUrl: z.string().url(),
  previewImageUrl: z.string().url().optional(),
  industryTags: z.array(z.string()).default([]),
  styleTags: z.array(z.string()).default([]),
  layoutTags: z.array(z.string()).default([]),
  isCurrent: z.boolean().default(true),
  isRecommended: z.boolean().default(true)
});

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = TemplateSchema.safeParse(await req.json());
  if (!payload.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const data = payload.data;
  const template = data.id
    ? await prisma.template.update({ where: { id: data.id }, data })
    : await prisma.template.create({ data: { ...data, status: data.isCurrent ? 'current' : 'legacy' } });

  return NextResponse.json({ template });
}
