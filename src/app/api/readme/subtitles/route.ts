import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/constants';

const FONT = "'JetBrains Mono','Fira Code','Cascadia Code',monospace";
const FONT_SIZE = 13.5;
const CHAR_W = FONT_SIZE * 0.612;   // monospace width ratio
const SEP = "   ◆   ";
const SEP_W = SEP.length * CHAR_W;
const BG = "#0d1117";
const SPEED = 58; // px per second

export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const widthString = searchParams.get('width');
  const width = widthString ? parseInt(widthString, 10) : 800;
  const heightString = searchParams.get('height');
  const height = heightString ? parseInt(heightString, 10) : 48;
  const speed = SPEED;

  // Fetch subtitles
  const response = await fetch(`${SITE_URL}/api/portfolio/subtitles`);
  let items: string[] = [];
  if (response.ok) {
    items = await response.json();
  }

  // Fallback if empty
  if (!items || items.length === 0) {
    items = [
      "A JavaScript expert with extensive knowledge and expertise in modern frameworks and libraries",
      "Skilled in and enthusiastic about React.js",
      "Fun to work with ;)"
    ];
  }

  const spans: { x: number, text: string, sep: boolean }[] = [];
  let x = 0;

  // Replace HTML encoded entities just in case
  const escapeHTML = (str: string) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  for (const item of items) {
    spans.push({ x, text: escapeHTML(item), sep: false });
    x += item.length * CHAR_W;
    spans.push({ x, text: escapeHTML(SEP), sep: true });
    x += SEP_W;
  }

  const copyWidth = x;

  const allSpans = [
    ...spans,
    ...spans.map((s) => ({ ...s, x: s.x + copyWidth })),
  ];

  const duration = copyWidth / speed;
  const cy = height / 2;

  const textElements = allSpans.map(({ x, text, sep }, i) => `
    <text
      x="${x}"
      y="${cy}"
      dominant-baseline="middle"
      alignment-baseline="middle"
      font-size="${FONT_SIZE}"
      font-family="${FONT}"
      letter-spacing="0.02em"
      fill="${sep ? "#58a6ff" : "#c9d1d9"}"
      xml:space="preserve"
    >${text}</text>
  `).join("");

  const svg = `
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg"
      style="display: block;"
    >
      <defs>
        <!-- Clip to SVG bounds -->
        <clipPath id="pm-clip">
          <rect width="${width}" height="${height}" />
        </clipPath>

        <!-- Edge-fade gradient -->
        <linearGradient id="pm-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="${BG}" stop-opacity="1" />
          <stop offset="7%"   stop-color="${BG}" stop-opacity="0" />
          <stop offset="93%"  stop-color="${BG}" stop-opacity="0" />
          <stop offset="100%" stop-color="${BG}" stop-opacity="1" />
        </linearGradient>
      </defs>

      <!-- Panel background -->
      <rect width="${width}" height="${height}" fill="${BG}" rx="8" />

      <!-- Top accent stripe -->
      <rect width="${width}" height="2" fill="#3b82f6" opacity="0.85" rx="1" />
      
      <!-- Bottom accent stripe -->
      <rect y="${height - 2}" width="${width}" height="2" fill="#3b82f6" opacity="0.85" rx="1" />

      <!-- Scrolling content -->
      <g clip-path="url(#pm-clip)">
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            from="0 0"
            to="-${copyWidth} 0"
            dur="${duration}s"
            repeatCount="indefinite"
          />
          ${textElements}
        </g>
      </g>

      <!-- Edge-fade overlay -->
      <rect width="${width}" height="${height}" fill="url(#pm-fade)" />
    </svg>
  `.trim();

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}