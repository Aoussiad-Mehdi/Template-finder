export const affiliateDefaults = {
  baseAffiliateUrl: process.env.AFFILIATE_BASE_URL || 'https://squarespace.syuh.net/Kj69Jv',
  deepLinkMode: (process.env.AFFILIATE_DEEP_LINK_MODE || 'query') as 'path' | 'query'
};
