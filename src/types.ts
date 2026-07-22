export interface PresetScenario {
  id: number;
  title: string;
  targetAudience: string;
  platform: string;
  language: 'zh-Hant-HK' | 'zh-Hans';
  landmarks: string[];
  defaultPrice: number; // Market average for deviation checks
  defaultArea: number; // in sq.ft.
  defaultPropertyID: string;
  copywriting: string;
  chaosInput: string;
  /** @since Phase 2 — Maps to the 4 content scenarios */
  scenario?: ContentScenario;
}

export interface ComplianceStatus {
  passed: boolean;
  priceDeviation: number; // percentage — informational only, no hard block
  redirectFiltered: boolean; // if WeChat/phone/WhatsApp numbers were replaced
  originalContactRemoved: string[]; // names of filtered words
  legalPreambleAdded: boolean;
  fallbacksApplied: {
    priceNull: boolean;
    propertyIDNull: boolean;
    mediaFilesNull: boolean;
  };
}

export interface QuizQuestion {
  id: number;
  category: string;
  question: string;
  choices: {
    text: string;
    isCorrect: boolean;
  }[];
  rationale: string;
}

export type UTMSource = 'facebook' | 'instagram' | 'whatsapp' | 'linkedin' | 'xiaohongshu';
export type UTMMedium = 'achievement' | 'property_listing' | 'finance_news' | 'hk_macro_policy';

/**
 * ContentScenario defines the 4 distinct content types the AI agent can generate.
 * These map to real-world use cases for a PropTech agent assistant.
 */
export type ContentScenario =
  | 'LINKEDIN_ACHIEVEMENT'  // Professional achievements, deals closed, personal branding
  | 'PROPERTY_LISTING'      // Property highlights, yields, transit, and school nets
  | 'FINANCE_NEWS'          // HK interest rate moves, Fed policy, mortgage caps, market trends
  | 'HK_POLICY';            // Top Talent Pass Scheme (高才通), stamp duty shifts, macro news

export interface UTMParams {
  id: string; // Property ID
  source: UTMSource;
  medium: UTMMedium;
  campaign: string; // agent_id
  content: string; // post_id
}

