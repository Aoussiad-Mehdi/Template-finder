import { describe, it, expect } from 'vitest';
import { recommendTemplate } from '@/lib/recommendation/recommendationEngine';

describe('recommendation', () => {
  it('returns best recommendation', () => {
    const result = recommendTemplate([
      {
        id: '1', createdAt: new Date(), updatedAt: new Date(), name: 'Quinn', slug: 'quinn', version: 'v7_1', family: '7.1', officialUrl: '', previewImageUrl: '', status: 'current',
        industryTags: ['service business'], styleTags: ['clean'], layoutTags: ['standard header'], description: '', isCurrent: true, isRecommended: true, sortOrder: 0
      } as any
    ], {
      siteCategory: ['service business'],
      layout: ['standard header'],
      visual: ['clean'],
      content: [],
      technical: []
    });

    expect(result.recommendedTemplate?.name).toBe('Quinn');
  });
});
