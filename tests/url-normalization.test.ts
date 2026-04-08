import { describe, it, expect, vi } from 'vitest';

vi.mock('node:dns/promises', () => ({
  default: { lookup: vi.fn().mockResolvedValue([{ address: '93.184.216.34' }]) }
}));

import { normalizeUrl } from '@/lib/url/normalize';

describe('normalizeUrl', () => {
  it('adds protocol and strips trackers', async () => {
    const out = await normalizeUrl('example.com/?utm_source=x&a=1');
    expect(out).toBe('https://example.com/?a=1');
  });
});
