import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { detectPlatform } from '@/lib/detectors/platformDetector';
import { detectSquarespaceVersion, detectSquarespace70Template } from '@/lib/detectors/squarespaceDetector';

const fixture = (name: string) => fs.readFileSync(`tests/fixtures/${name}`, 'utf8');

describe('detectors', () => {
  it('detects shopify platform', () => {
    const result = detectPlatform([{ url: 'x', rawHtml: fixture('shopify.html'), renderedHtml: '', headings: [], links: [] }]);
    expect(result.platform).toBe('Shopify');
  });

  it('detects squarespace version', () => {
    const result = detectSquarespaceVersion([{ url: 'x', rawHtml: fixture('squarespace71.html'), renderedHtml: '', headings: [], links: [] }]);
    expect(result.version).toBe('7.1');
  });

  it('scores squarespace 7.0 family', () => {
    const result = detectSquarespace70Template([{ url: 'x', rawHtml: fixture('squarespace70.html'), renderedHtml: '', headings: [], links: [] }]);
    expect(result.family).toBe('Brine');
  });
});
