import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/utils/adminAuth';
import { processAnalysis } from '@/lib/analysis/runAnalysis';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await processAnalysis(id);
  return NextResponse.json({ status: 'reprocessed' });
}
