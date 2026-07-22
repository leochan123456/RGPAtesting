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
 * Dynamically constructs a trackable URL with UTM parameters.
 *
 * @formula
 *   https://ricacorp.com/property/{id}
 *     ?utm_source={platform}
 *     &utm_medium={scenario}
 *     &utm_campaign={agent_id}
 *     &utm_content={post_id}
 *
 * Trims whitespace; if a required field is empty or missing a safe
 * fallback placeholder is substituted so the URL is always well-formed.
 */
export function generateUtmUrl(params: UTMParams): string {
  const id = (params.id ?? '').trim();
  const source = (params.source ?? '').trim();
  const medium = (params.medium ?? '').trim();
  const campaign = (params.campaign ?? '').trim();
  const content = (params.content ?? '').trim();

  const propertyId = encodeURIComponent(id || 'unknown-property');
  const utmSource = encodeURIComponent((SUPPORTED_UTM_SOURCES as string[]).includes(source) ? source : 'direct');
  const utmMedium = encodeURIComponent((SUPPORTED_UTM_MEDIUMS as string[]).includes(medium) ? medium : 'organic');
  const utmCampaign = encodeURIComponent(campaign || 'general-agent');
  const utmContent = encodeURIComponent(content || 'post-content');

  return (
    `https://ricacorp.com/property/${propertyId}` +
    `?utm_source=${utmSource}` +
    `&utm_medium=${utmMedium}` +
    `&utm_campaign=${utmCampaign}` +
    `&utm_content=${utmContent}`
  );
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

// ──────────────────────────────────────────────
// QR Code Payloads
// ──────────────────────────────────────────────

/**
 * QR-code payload shape returned by the generator.
 * `qrApiUrl` points to a dynamic QR-code rendering service;
 * `dataUrl` encodes the UTM target for on-device generation.
 */
export interface QrCodePayload {
  /** The actual tracked destination URL */
  targetUrl: string;
  /** A ready-to-use QR-code image URL (via qrserver API) */
  qrApiUrl: string;
  /** Data URI for programmatic QR rendering (can be passed to a canvas) */
  dataUri: string;
}

/**
 * Generates a QR-code-ready payload from a UTM URL.
 *
 * Uses the `api.qrserver.com` public rendering API — suitable for
 * WhatsApp share sheets, email footers, and print-ready EAA flyers.
 */
export function generateQrCodePayload(utmUrl: string, size = 200): QrCodePayload {
  const encodedUrl = encodeURIComponent(utmUrl);
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}`;
  // Minimal inline SVG data URI (useful for canvas-free embeds)
  const dataUri = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}&format=svg`;

  return {
    targetUrl: utmUrl,
    qrApiUrl,
    dataUri,
  };
}

/**
 * Full-stack convenience: build a UTM URL from raw params AND produce
 * the corresponding QR-code payload in one call.
 */
export function generateUtmWithQr(
  id: string,
  source: UTMSource,
  medium: UTMMedium,
  campaign: string,
  content: string,
  qrSize?: number,
): { utmUrl: string; qr: QrCodePayload } {
  const utmUrl = generateUtmUrl({ id, source, medium, campaign, content });
  return { utmUrl, qr: generateQrCodePayload(utmUrl, qrSize) };
}

// ──────────────────────────────────────────────
// Copy appending
// ──────────────────────────────────────────────

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
