import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { isAdminAuthorized } from '@/lib/utils/adminAuth';

const ConfigSchema = z.object({
  baseAffiliateUrl: z.string().url(),
  deepLinkMode: z.enum(['path', 'query']),
  enabled: z.boolean().default(true)
});

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = ConfigSchema.safeParse(await req.json());
  if (!payload.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const config = await prisma.affiliateConfig.upsert({
    where: { id: 'default-affiliate-config' },
    update: payload.data,
    create: { id: 'default-affiliate-config', ...payload.data }
  });

  return NextResponse.json({ config });
}
