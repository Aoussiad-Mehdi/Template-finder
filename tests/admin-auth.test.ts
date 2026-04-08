import { describe, it, expect } from 'vitest';
import { isAdminAuthorized } from '@/lib/utils/adminAuth';

process.env.ADMIN_PASSWORD = 'secret';

describe('admin auth', () => {
  it('accepts valid password', () => {
    const req = { headers: { get: (key: string) => key === 'x-admin-password' ? 'secret' : null } } as any;
    expect(isAdminAuthorized(req)).toBe(true);
  });
});
