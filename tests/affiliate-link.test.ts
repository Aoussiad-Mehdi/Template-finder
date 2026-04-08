import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    affiliateConfig: {
      findFirst: vi.fn().mockResolvedValue({ baseAffiliateUrl: 'https://squarespace.syuh.net/Kj69Jv', deepLinkMode: 'query' })
    }
  }
}));

import { buildAffiliateLink } from '@/lib/affiliate/buildAffiliateLink';

describe('buildAffiliateLink', () => {
  it('builds query deep link', async () => {
    const link = await buildAffiliateLink('paloma');
    expect(link).toContain('squarespace.syuh.net/Kj69Jv?u=');
    expect(link).toContain(encodeURIComponent('https://www.squarespace.com/templates/paloma'));
  });
});
