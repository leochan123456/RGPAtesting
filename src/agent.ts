/**
 * ═══════════════════════════════════════════════════════════════
 *  Rica+ AI Agent — System Prompt (Phase 2: Multi-Scenario & Free Market)
 * ═══════════════════════════════════════════════════════════════
 *
 *  Role : Senior PropTech AI Copywriter & Personal Branding Strategist
 *  Domain : Hong Kong Real Estate (利嘉閣地產 / Ricacorp Properties)
 *
 *  Core Principles:
 *  1. FREE-MARKET PRICING — No strict price-deviation hard-locks.
 *     Sellers/landlords set their own asking price. The AI may flag
 *     large deviations as a courtesy notice, but MUST NEVER block,
 *     freeze, or disable copy generation or clipboard operations.
 *  2. SCENARIO-AWARE COPYWRITING — The AI receives a `ContentScenario`
 *     tag and MUST tailor tone, structure, and call-to-action accordingly.
 *  3. PLATFORM-AWARE — Each target platform (LinkedIn, Instagram,
 *     WhatsApp, Facebook, Xiaohongshu, etc.) has its own conventions
 *     for length, hashtags, emoji density, and CTAs.
 *  4. EAA COMPLIANCE — Always append agency license, authorization
 *     status, and publication date. Redirect-filter WeChat/phone
 *     numbers per EAA guidelines.
 * ═══════════════════════════════════════════════════════════════
 */

import { UTMSource } from './types';
import { generateUtmUrl } from './utils/utmEngine';

export const SYSTEM_PROMPT = `You are Rica+ AI, a Senior PropTech Copywriting & Personal Branding Assistant built for Ricacorp Properties (利嘉閣地產).

────────────────────────────────────────
SCENARIO RULES
────────────────────────────────────────

When a scenario is provided, follow the guidance below:

1. LINKEDIN_ACHIEVEMENT
   - Tone: Professional, confident, personal-brand oriented.
   - Content: Highlight closed deals, career milestones, market insights, thought leadership.
   - Avoid hard property specs; focus on the agent's expertise & outcomes.
   - CTA: Connect / DM for advisory / "Let's discuss the market".
   - Language: Prefer English or bilingual (Eng + Trad Chinese).

2. PROPERTY_LISTING
   - Tone: Persuasive, detail-rich, urgency-driven.
   - Content: Price, area, location highlights, transit, school nets, yield data.
   - Must include: formatted price, sq.ft., property ID, agency disclaimer.
   - CTA: Inbox /预约睇樓 / WhatsApp link.
   - Language: Match the platform's dominant language (Hant/Hans).

3. FINANCE_NEWS
   - Tone: Analytical, authoritative, data-backed.
   - Content: HKMA / Fed rate decisions, mortgage cap changes, market trends.
   - Include specific numbers (rate %, HIBOR, cap ratios) where possible.
   - CTA: "Stay tuned for our full analysis" / "DM for a portfolio review".
   - Language: Professional Trad Chinese.

4. HK_POLICY
   - Tone: Informative, timely, policy-aware.
   - Content: Top Talent Pass Scheme (高才通), stamp duty adjustments (DSD/NRSD), macro policy impacts.
   - Explain how the policy affects buyers/ sellers/ tenants.
   - CTA: "Book a free consultation to understand your eligibility".
   - Language: Trad Chinese with key English policy terms.

────────────────────────────────────────
FREE-MARKET PRICING (OVERRIDING RULE)
────────────────────────────────────────

- The asking price is the seller's/landlord's decision.
- NEVER block, disable, or interfere with clipboard copy operations.
- NEVER prevent the user from copying generated text.
- NEVER show a "blocked" or "locked" message due to price deviation.
- If the price deviates significantly from market average, you MAY add a
  courteous advisory note (e.g., "Note: This price differs from the
  market average of HK$ X,XXX — please confirm with your client."),
  but you MUST still generate the full copy and allow all copy actions.

────────────────────────────────────────
PLATFORM BEST PRACTICES
────────────────────────────────────────

- WhatsApp / Telegram: Short, bold, CTA-heavy. Use *bold* markers.
- Xiaohongshu: UGC-style, emoji-rich, zero raw links, filter contact info.
- Instagram: Premium visual-first, 3-5 hashtags max, lifestyle angle.
- Facebook: Yield/investment focused for 35+ audience, longer paragraphs.
- LinkedIn: Thought-leadership, deal-story, professional hashtags.
- X / Threads: Concise, link-free, conversational hook.
- Douyin / YouTube Shorts: Script format with timecode segments.

────────────────────────────────────────
EAA COMPLIANCE (MANDATORY)
────────────────────────────────────────

Every generated copy MUST end with:
  [Agency Name]（牌照號碼：C-001702）
  委託狀態：已獲業主書面授權委託放盤
  廣告發布日期：[today's date]

Filter WeChat IDs, phone numbers, and WhatsApp numbers from the body text
and replace with generic CTAs ("點擊頭像私信我" or equivalent).`;

/**
 * Build a context payload for the AI completion call.
 */
export function buildAgentPayload(params: {
  scenario: string;
  platform: string;
  chaosInput: string;
  parsedPrice: number;
  parsedArea: number;
  parsedPropID: string;
  parsedLandmark: string;
  marketAvgPrice: number;
  language: string;
}): { system: string; user: string } {
  const {
    scenario,
    platform,
    chaosInput,
    parsedPrice,
    parsedArea,
    parsedPropID,
    parsedLandmark,
    marketAvgPrice,
    language,
  } = params;

  const userPrompt = [
    `[SCENARIO] ${scenario}`,
    `[PLATFORM] ${platform}`,
    `[LANGUAGE] ${language}`,
    `[LANDMARK] ${parsedLandmark}`,
    `[PRICE] HK$ ${parsedPrice.toLocaleString()} (market avg: HK$ ${marketAvgPrice.toLocaleString()})`,
    `[AREA] ${parsedArea > 0 ? `${parsedArea} sq.ft.` : 'N/A'}`,
    `[PROPERTY_ID] ${parsedPropID || 'N/A'}`,
    ``,
    `Raw listing input:`,
    chaosInput,
    ``,
    `Generate platform-appropriate copy and return it as plain text.`,
  ].join('\n');

  return {
    system: SYSTEM_PROMPT,
    user: userPrompt,
  };
}

// ═══════════════════════════════════════════════════════════════
//  Share Intent Detection & Smart Deep-Link Generation (Phase 2)
// ═══════════════════════════════════════════════════════════════

/** Mapped set of Chinese + English trigger phrases for share commands. */
const SHARE_INTENT_PATTERNS: { regex: RegExp; platform: UTMSource }[] = [
  { regex: /(?:分享|傳送|發送|send|share|post).*(?:WhatsApp|whatsapp|ws|wa)/i,   platform: 'whatsapp' },
  { regex: /(?:分享|傳送|發送|send|share|post).*(?:facebook|fb|臉書|面書)/i,       platform: 'facebook' },
  { regex: /(?:分享|傳送|發送|send|share|post).*(?:instagram|ig|ins)/i,            platform: 'instagram' },
  { regex: /(?:分享|傳送|發送|send|share|post).*(?:linkedin|領英)/i,               platform: 'linkedin' },
  { regex: /(?:分享|傳送|發送|send|share|post).*(?:小紅書|小红书|xiaohongshu|red)/i, platform: 'xiaohongshu' },
];

/**
 * Result returned when the user's message is recognised as a share command.
 */
export interface ShareIntent {
  detected: true;
  /** Which platform the user wants to share to */
  targetPlatform: UTMSource;
  /** A human-readable label for the button / notification */
  platformLabel: string;
}

const PLATFORM_LABELS: Record<UTMSource, string> = {
  whatsapp:    'WhatsApp',
  facebook:    'Facebook',
  instagram:   'Instagram',
  linkedin:    'LinkedIn',
  xiaohongshu: '小紅書',
};

/**
 * Deep-link payload produced for a detected share intent.
 * Rendered as a tappable action button inside the chat bubble.
 */
export interface ShareDeepLink {
  platform: UTMSource;
  label: string;
  /** URL that opens the native platform composer / share flow */
  actionUrl: string;
  icon: 'whatsapp' | 'facebook' | 'instagram' | 'linkedin' | 'xiaohongshu';
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Scans the user's raw input for share-intent trigger phrases.
 * Returns a structured {@link ShareIntent} when found, or `null`.
 */
export function parseShareIntent(rawText: string): ShareIntent | null {
  for (const { regex, platform } of SHARE_INTENT_PATTERNS) {
    if (regex.test(rawText)) {
      return {
        detected: true,
        targetPlatform: platform,
        platformLabel: PLATFORM_LABELS[platform],
      };
    }
  }
  return null;
}

/**
 * Builds a platform-specific deep-link URL that carries the already-generated
 * marketing copy (with UTM appended) directly into the target app's composer.
 *
 * @param platform  Target social / messaging platform
 * @param copyText  The full platform-optimised text block (copies.whatsapp, etc.)
 * @param utmParams UTM parameters for the tracked property link embedded in the deep-link
 */
export function buildPlatformDeepLink(
  platform: UTMSource,
  copyText: string,
  utmParams: { id: string; campaign: string; content: string },
): ShareDeepLink {
  const utmUrl = generateUtmUrl({
    id: utmParams.id || 'unknown',
    source: platform,
    medium: 'property_listing',
    campaign: utmParams.campaign || 'general-agent',
    content: utmParams.content || 'post-content',
  });

  // Append the tracked UTM link to the copy before encoding
  const fullText = `${copyText}\n\n🔗 ${utmUrl}`;
  const encoded = encodeURIComponent(fullText);

  let actionUrl = '';
  switch (platform) {
    case 'whatsapp':
      actionUrl = `https://wa.me/?text=${encoded}`;
      break;
    case 'facebook':
      actionUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(utmUrl)}&quote=${encodeURIComponent(copyText)}`;
      break;
    case 'instagram':
      // Instagram has no web share-composer; open the app / profile instead
      actionUrl = 'https://www.instagram.com';
      break;
    case 'linkedin':
      actionUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(utmUrl)}`;
      break;
    case 'xiaohongshu':
      // Xiaohongshu has no public share URL; open the explore page
      actionUrl = 'https://www.xiaohongshu.com';
      break;
  }

  return {
    platform,
    label: PLATFORM_LABELS[platform],
    actionUrl,
    icon: platform,
  };
}

/**
 * Convenience: parse + build deep-link in one call.
 * Returns `null` when no share intent is detected.
 */
export function handleShareCommand(
  rawText: string,
  copyText: string,
  utmParams: { id: string; campaign: string; content: string },
): { intent: ShareIntent; deepLink: ShareDeepLink } | null {
  const intent = parseShareIntent(rawText);
  if (!intent) return null;

  const deepLink = buildPlatformDeepLink(
    intent.targetPlatform,
    copyText,
    utmParams,
  );
  return { intent, deepLink };
}
