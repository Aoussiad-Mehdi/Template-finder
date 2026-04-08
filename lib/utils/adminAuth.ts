import { NextRequest } from 'next/server';

export function isAdminAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('x-admin-password') || '';
  return Boolean(process.env.ADMIN_PASSWORD) && auth === process.env.ADMIN_PASSWORD;
}
