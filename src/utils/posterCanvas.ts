/**
 * ═══════════════════════════════════════════════════════════════
 *  Rica+ HTML5 Canvas Poster Generator (Phase 5)
 * ═══════════════════════════════════════════════════════════════
 *
 *  Renders a game-style promotional poster on an off-screen
 *  <canvas> element. The poster consists of four layers:
 *
 *     Layer 1 — Property / agent photo (uploaded image)
 *     Layer 2 — Key stats overlay (price, area, prop ID, landmark)
 *     Layer 3 — Ricacorp branding + licence + EAA compliance text
 *     Layer 4 — Auto-generated QR code linking to the UTM-tracked URL
 *
 *  Output is a PNG Blob suitable for navigator.share()
 *  or a programmatic download.
 */

import { generateUtmUrl, type QrCodePayload } from './utmEngine';
import type { UTMSource, UTMMedium } from '../types';

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920; // 9:16 vertical poster (Instagram Story / 小紅書)

const BRAND_COLOR = '#FF6600';
const BRAND_DARK = '#1E293B';
const BRAND_WHITE = '#FFFFFF';

// ──────────────────────────────────────────────
// Public Interface
// ──────────────────────────────────────────────

export interface PosterConfig {
  /** URL of the property or agent photo (from uploadedFiles) */
  photoUrl?: string;
  /** Formatted price display string (e.g. "意向月租：HK$ 13,000 /月") */
  priceText: string;
  /** Formatted area string (e.g. "實用面積：約 310 平方呎") */
  areaText: string;
  /** Property ID (e.g. "AH2023101") */
  propertyId: string;
  /** Landmark / district name */
  landmark: string;
  /** UTM parameters for the QR-code link */
  utm: {
    id: string;
    source: UTMSource;
    medium: UTMMedium;
    campaign: string;
    content: string;
  };
  /** Platform-specific copy text to show as a caption strip */
  captionText: string;
  /** ISO date string for the publication date */
  publishDate: string;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/**
 * Loads an image from a URL into an HTMLImageElement.
 * Fails gracefully — returns null if the URL is missing or load fails.
 */
function loadImage(url?: string): Promise<HTMLImageElement | null> {
  if (!url) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Draws rounded-rect corners via clipping path.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ──────────────────────────────────────────────
// Core Renderer
// ──────────────────────────────────────────────

/**
 * Renders the full 4-layer poster on an HTML5 Canvas and returns
 * a PNG Blob.
 *
 * @param config  Poster content configuration
 * @returns       Promise<Blob> — PNG image ready for share/download
 */
export async function renderPosterBlob(config: PosterConfig): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // ── Layer 0: Background fill ──
  ctx.fillStyle = BRAND_DARK;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // ── Layer 1: Property / Agent Photo ──
  const photoImg = await loadImage(config.photoUrl);
  if (photoImg) {
    // Cover-fit the photo in the top 60% of the canvas
    const photoY = 0;
    const photoH = Math.round(CANVAS_HEIGHT * 0.62);
    const scale = Math.max(CANVAS_WIDTH / photoImg.width, photoH / photoImg.height);
    const sw = photoImg.width * scale;
    const sh = photoImg.height * scale;
    const sx = (sw - CANVAS_WIDTH) / 2;
    const sy = (sh - photoH) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, photoY, CANVAS_WIDTH, photoH);
    ctx.clip();
    ctx.drawImage(photoImg, -sx, -sy, sw, sh);
    ctx.restore();

    // Gradient fade overlay at the bottom of the photo
    const fadeGrad = ctx.createLinearGradient(0, photoH - 260, 0, photoH);
    fadeGrad.addColorStop(0, 'rgba(30,41,59,0)');
    fadeGrad.addColorStop(0.7, 'rgba(30,41,59,0.85)');
    fadeGrad.addColorStop(1, BRAND_DARK);
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, photoH - 260, CANVAS_WIDTH, 260);
  }

  // ── Layer 2: Key Stats Overlay ──
  const statsY = photoImg ? Math.round(CANVAS_HEIGHT * 0.55) : 320;

  // Semi-transparent stat card background
  ctx.save();
  roundRect(ctx, 48, statsY, CANVAS_WIDTH - 96, 380, 24);
  ctx.fillStyle = 'rgba(30,41,59,0.82)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Accent line at the top of the stat card
  ctx.fillStyle = BRAND_COLOR;
  roundRect(ctx, 48, statsY, CANVAS_WIDTH - 96, 6, 3);
  ctx.fill();

  // Price — large, bold, prominent
  ctx.fillStyle = BRAND_WHITE;
  ctx.font = 'bold 52px "Noto Sans HK", "PingFang HK", "Microsoft JhengHei", sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText(formatPriceForPoster(config.priceText), 90, statsY + 40);

  // Area + Prop ID row
  ctx.font = '400 32px "Noto Sans HK", "PingFang HK", "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(config.areaText, 90, statsY + 120);
  ctx.fillText(`物業編號：${config.propertyId || '—'}`, 90, statsY + 175);

  // Landmark tag chip
  ctx.save();
  roundRect(ctx, 90, statsY + 235, Math.min(ctx.measureText(config.landmark).width + 50, 400), 50, 25);
  ctx.fillStyle = BRAND_COLOR;
  ctx.fill();
  ctx.fillStyle = BRAND_WHITE;
  ctx.font = 'bold 28px "Noto Sans HK", "PingFang HK", "Microsoft JhengHei", sans-serif';
  ctx.fillText(`📍 ${config.landmark}`, 110, statsY + 246);
  ctx.restore();

  // ── Layer 3: Branding + EAA Compliance ──
  const brandY = statsY + 420;

  // Brand strip
  ctx.save();
  roundRect(ctx, 48, brandY, CANVAS_WIDTH - 96, 170, 20);
  ctx.fillStyle = 'rgba(255,102,0,0.12)';
  ctx.fill();
  ctx.restore();

  // Ricacorp logo text
  ctx.fillStyle = BRAND_COLOR;
  ctx.font = 'bold 42px "Noto Sans HK", "PingFang HK", "Microsoft JhengHei", sans-serif';
  ctx.fillText('利嘉閣地產', 90, brandY + 35);

  // Licence number
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '400 24px "Noto Sans HK", "PingFang HK", "Microsoft JhengHei", sans-serif';
  ctx.fillText('牌照號碼：C-001702', 90, brandY + 90);

  // EAA compliance line
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '400 20px "Noto Sans HK", "PingFang HK", "Microsoft JhengHei", sans-serif';
  ctx.fillText(
    `已獲業主書面授權委託放盤  ·  廣告發布日期：${config.publishDate}`,
    90,
    brandY + 130,
  );

  // ── Layer 4: QR Code ──
  const qrUrl = generateUtmUrl(config.utm);
  const qrSize = 200;
  const qrX = CANVAS_WIDTH - 48 - qrSize;
  const qrY = brandY + 40;

  // QR white background
  ctx.save();
  roundRect(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 16);
  ctx.fillStyle = BRAND_WHITE;
  ctx.fill();
  ctx.restore();

  // Load QR image from API
  const qrImg = await loadImage(
    `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrUrl)}`,
  );
  if (qrImg) {
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  }

  // QR label below
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '400 18px "Noto Sans HK", "PingFang HK", "Microsoft JhengHei", sans-serif';
  ctx.fillText('掃碼查看真盤源', qrX + 22, qrY + qrSize + 22);

  // ── Bottom Caption Strip ──
  const captionY = CANVAS_HEIGHT - 220;
  ctx.save();
  roundRect(ctx, 48, captionY, CANVAS_WIDTH - 96, 140, 20);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = '400 22px "Noto Sans HK", "PingFang HK", "Microsoft JhengHei", sans-serif';
  // Truncate long captions to two lines
  const maxCaptionWidth = CANVAS_WIDTH - 180;
  const captionLines = wrapText(ctx, config.captionText, maxCaptionWidth, 2);
  captionLines.forEach((line, i) => {
    ctx.fillText(line, 90, captionY + 40 + i * 34);
  });

  // Footer: Rica+ badge
  ctx.fillStyle = BRAND_COLOR;
  ctx.font = 'bold 22px "Noto Sans HK", "PingFang HK", "Microsoft JhengHei", sans-serif';
  ctx.fillText('Rica+ GPA · 100% 真盤源', 90, CANVAS_HEIGHT - 60);

  // ── Convert to Blob ──
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob returned null'));
    }, 'image/png');
  });
}

// ──────────────────────────────────────────────
// Utility: Text wrapping for caption
// ──────────────────────────────────────────────

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const lines: string[] = [];
  let current = '';
  for (const char of text) {
    const test = current + char;
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current);
      current = char;
      if (lines.length >= maxLines) break;
    } else {
      current = test;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

// ──────────────────────────────────────────────
// Formatting helper
// ──────────────────────────────────────────────

function formatPriceForPoster(raw: string): string {
  // Collapse common price formats like "意向月租：HK$ 13,000 /月" → "HK$ 13,000 /月"
  return raw.replace(/^(?:意向(?:月租|售價)[：:]\s*)?/, '');
}

// ──────────────────────────────────────────────
// Native Share + Fallback
// ──────────────────────────────────────────────

export interface ShareResult {
  method: 'native' | 'download-fallback';
  success: boolean;
}

/**
 * Attempts native Web Share API; falls back to downloading the poster
 * PNG and copying the copy text to clipboard.
 *
 * @param posterBlob  PNG blob from renderPosterBlob()
 * @param copyText    Formatted text to copy when native share is unsupported
 * @param utmUrl      UTM URL to include in the share
 * @param fileName    Download filename (e.g. "ricacorp-AH2023101.png")
 */
export async function sharePosterWithFallback(
  posterBlob: Blob,
  copyText: string,
  utmUrl: string,
  fileName: string,
): Promise<ShareResult> {
  // Try native Web Share API first
  if (navigator.share && navigator.canShare) {
    const file = new File([posterBlob], fileName, { type: 'image/png' });
    const shareData: ShareData = {
      files: [file],
      text: copyText,
      url: utmUrl,
    };

    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return { method: 'native', success: true };
      } catch (err) {
        // User cancelled or share failed — fall through to fallback
        if (err instanceof Error && err.name === 'AbortError') {
          return { method: 'native', success: false };
        }
      }
    }
  }

  // ── Fallback: download image + copy text to clipboard ──
  try {
    // Step 1: trigger PNG download
    const url = URL.createObjectURL(posterBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Step 2: copy text to clipboard
    const fullText = `${copyText}\n\n🔗 ${utmUrl}`;
    await navigator.clipboard.writeText(fullText);

    return { method: 'download-fallback', success: true };
  } catch {
    return { method: 'download-fallback', success: false };
  }
}
