import { UTMParams, UTMSource, UTMMedium } from '../types';

export const SUPPORTED_UTM_SOURCES: UTMSource[] = [
  'facebook',
  'instagram',
  'whatsapp',
  'linkedin',
  'xiaohongshu'
];

export const SUPPORTED_UTM_MEDIUMS: UTMMedium[] = [
  'achievement',
  'property_listing',
  'finance_news',
  'hk_macro_policy'
];

/**
 * Validates whether a string is a supported UTM source
 */
export function isValidUtmSource(source: string): source is UTMSource {
  return SUPPORTED_UTM_SOURCES.includes(source as UTMSource);
}

/**
 * Validates whether a string is a supported UTM medium
 */
export function isValidUtmMedium(medium: string): medium is UTMMedium {
  return SUPPORTED_UTM_MEDIUMS.includes(medium as UTMMedium);
}

/**
 * Dynamically constructs a trackable URL with UTM parameters based on the formula:
 * https://ricacorp.com/property/{id}?utm_source={platform}&utm_medium={scenario}&utm_campaign={agent_id}&utm_content={post_id}
 * 
 * If parameters are missing, sensible defaults or placeholders are applied.
 */
export function generateUtmUrl(params: UTMParams): string {
  const propertyId = encodeURIComponent(params.id || 'unknown-property');
  const source = encodeURIComponent(params.source || 'direct');
  const medium = encodeURIComponent(params.medium || 'organic');
  const campaign = encodeURIComponent(params.campaign || 'general-agent');
  const content = encodeURIComponent(params.content || 'post-content');

  return `https://ricacorp.com/property/${propertyId}?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}&utm_content=${content}`;
}

/**
 * Helper function to generate a raw UTM URL with individual parameters
 */
export function generateRawUtmUrl(
  id: string,
  source: UTMSource,
  medium: UTMMedium,
  campaign: string,
  content: string
): string {
  return generateUtmUrl({ id, source, medium, campaign, content });
}

/**
 * Appends the UTM link elegantly to an existing platform marketing copy block
 */
export function appendUtmToCopy(copyText: string, utmUrl: string, platform: UTMSource): string {
  const footerIndex = copyText.indexOf('---');
  // For Xiaohongshu, avoid direct plain links or handle carefully, but provide URL text
  const linkLabel = platform === 'xiaohongshu' 
    ? '🔗 複製瀏覽器打開，看官方登記真盤源：' 
    : '🔗 線上真盤源詳情：';

  if (footerIndex !== -1) {
    return copyText.slice(0, footerIndex) + `${linkLabel}\n${utmUrl}\n\n` + copyText.slice(footerIndex);
  }
  
  return copyText + `\n\n${linkLabel}\n${utmUrl}`;
}
