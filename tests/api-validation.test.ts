import { describe, it, expect } from 'vitest';
import { AnalyzeInputSchema } from '@/lib/url/normalize';

describe('api validation', () => {
  it('rejects bad url', () => {
    const parsed = AnalyzeInputSchema.safeParse({ url: 'not a url' });
    expect(parsed.success).toBe(false);
  });
});
