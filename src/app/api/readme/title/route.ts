// app/api/readme-title/route.ts
//
// Center-aligned design with animated flanking lines & diamond ornaments.
//
// Usage:
//   ![Projects](https://abdxdev.vercel.app/api/readme-title?text=Projects)
//   ![Skills](https://abdxdev.vercel.app/api/readme-title?text=Skills&color=purple)
//
// Params:
//   text / t   — label (max 40 chars)
//   color / c  — blue | purple | green | amber | pink | teal  (default: blue)

import { NextRequest, NextResponse } from 'next/server'

const THEMES: Record<string, { accent: string; dim: string; mid: string }> = {
  blue: { accent: '#60a5fa', dim: '#1e3a5f', mid: '#3b82f6' },
  purple: { accent: '#c4b5fd', dim: '#3b1f6e', mid: '#8b5cf6' },
  green: { accent: '#6ee7b7', dim: '#064e3b', mid: '#10b981' },
  amber: { accent: '#fcd34d', dim: '#78350f', mid: '#f59e0b' },
  pink: { accent: '#f9a8d4', dim: '#831843', mid: '#ec4899' },
  teal: { accent: '#5eead4', dim: '#134e4a', mid: '#14b8a6' },
}

function esc(s: string) {
  return s.replace(/[<>&"']/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!),
  )
}

// Layout
const FONT = "'Cascadia Code','Fira Code','JetBrains Mono',monospace"
const FS = 22          // font-size px
const CHAR_W = 13.25       // measured mono char width at 22px
const H = 56          // fixed height
const LINE_MARGIN = 20        // outer edge → line start
const LINE_GAP = 12        // gap between line tip and text edge
const SIDE_PAD = 72        // total horizontal space reserved for each line side

function buildSvg(text: string, theme: typeof THEMES[string]): string {
  const label = "     " + esc(text).trim() + " ";
  const textW = Math.ceil((text.length + 2) * CHAR_W)
  const W = textW + SIDE_PAD * 2            // total svg width
  const cx = W / 2
  const cy = H / 2

  // Line endpoints
  const lineY = cy - 1
  const lx1 = LINE_MARGIN                     // left outer
  const lx2 = cx - textW / 2 - LINE_GAP       // left inner (near text)
  const rx1 = cx + textW / 2 + LINE_GAP       // right inner
  const rx2 = W - LINE_MARGIN                  // right outer

  // Diamond ornament size
  const D = 4

  const { accent, dim, mid } = theme

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" xml:space="preserve">
<defs>
  <linearGradient id="lg-l" x1="${lx1}" y1="0" x2="${lx2}" y2="0" gradientUnits="userSpaceOnUse">
    <stop offset="0%" stop-color="${accent}" stop-opacity="0"/>
    <stop offset="100%" stop-color="${accent}" stop-opacity="1"/>
  </linearGradient>
  <linearGradient id="lg-r" x1="${rx1}" y1="0" x2="${rx2}" y2="0" gradientUnits="userSpaceOnUse">
    <stop offset="0%" stop-color="${accent}" stop-opacity="1"/>
    <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="glow-l" x1="${lx1}" y1="0" x2="${lx2}" y2="0" gradientUnits="userSpaceOnUse">
    <stop offset="0%" stop-color="${mid}" stop-opacity="0"/>
    <stop offset="100%" stop-color="${mid}" stop-opacity="0.7"/>
  </linearGradient>
  <linearGradient id="glow-r" x1="${rx1}" y1="0" x2="${rx2}" y2="0" gradientUnits="userSpaceOnUse">
    <stop offset="0%" stop-color="${mid}" stop-opacity="0.7"/>
    <stop offset="100%" stop-color="${mid}" stop-opacity="0"/>
  </linearGradient>
  <filter id="f-glow" x="-50%" y="-300%" width="200%" height="700%">
    <feGaussianBlur stdDeviation="2.5" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>

<!-- Panel -->
<rect width="${W}" height="${H}" rx="10" fill="#0d1117"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="9.5" stroke="#161b22" stroke-width="1"/>

<!-- Dim inner bg strip behind text -->
<rect x="${cx - textW / 2 - 2}" y="${cy - FS / 2 - 4}" width="${textW + 4}" height="${FS + 8}" rx="4" fill="${dim}" opacity=".35"/>

<!-- ── Left line ───────────────────────────────── -->
<!-- glow layer -->
<line x1="${lx2}" y1="${lineY}" x2="${lx2}" y2="${lineY}" stroke="url(#glow-l)" stroke-width="3" stroke-linecap="round" opacity=".6">
  <animate attributeName="x1" from="${lx2}" to="${lx1}" dur=".55s" fill="freeze" begin=".05s" calcMode="spline" keyTimes="0;1" keySplines=".4 0 .2 1"/>
</line>
<!-- crisp layer -->
<line x1="${lx2}" y1="${lineY}" x2="${lx2}" y2="${lineY}" stroke="url(#lg-l)" stroke-width="1.5" stroke-linecap="round">
  <animate attributeName="x1" from="${lx2}" to="${lx1}" dur=".55s" fill="freeze" begin=".05s" calcMode="spline" keyTimes="0;1" keySplines=".4 0 .2 1"/>
</line>

<!-- ── Right line ──────────────────────────────── -->
<line x1="${rx1}" y1="${lineY}" x2="${rx1}" y2="${lineY}" stroke="url(#glow-r)" stroke-width="3" stroke-linecap="round" opacity=".6">
  <animate attributeName="x2" from="${rx1}" to="${rx2}" dur=".55s" fill="freeze" begin=".05s" calcMode="spline" keyTimes="0;1" keySplines=".4 0 .2 1"/>
</line>
<line x1="${rx1}" y1="${lineY}" x2="${rx1}" y2="${lineY}" stroke="url(#lg-r)" stroke-width="1.5" stroke-linecap="round">
  <animate attributeName="x2" from="${rx1}" to="${rx2}" dur=".55s" fill="freeze" begin=".05s" calcMode="spline" keyTimes="0;1" keySplines=".4 0 .2 1"/>
</line>

<!-- ── Left diamond ornament ──────────────────── -->
<g filter="url(#f-glow)" opacity="0">
  <polygon points="${lx2},${lineY - D} ${lx2 + D},${lineY} ${lx2},${lineY + D} ${lx2 - D},${lineY}" fill="${accent}"/>
  <animate attributeName="opacity" from="0" to="1" dur=".2s" fill="freeze" begin=".5s"/>
</g>
<!-- ── Right diamond ornament ─────────────────── -->
<g filter="url(#f-glow)" opacity="0">
  <polygon points="${rx1},${lineY - D} ${rx1 + D},${lineY} ${rx1},${lineY + D} ${rx1 - D},${lineY}" fill="${accent}"/>
  <animate attributeName="opacity" from="0" to="1" dur=".2s" fill="freeze" begin=".5s"/>
</g>

<!-- ── Center text (rises + fades in) ─────────── -->
<text
  x="${cx}"
  y="${cy + 1}"
  text-anchor="middle"
  dominant-baseline="central"
  font-family="${FONT}"
  font-size="${FS}"
  font-weight="500"
  letter-spacing=".03em"
  fill="#e6edf3"
  opacity="0"
  transform="translate(0, 0)">${label}<animateTransform attributeName="transform" type="translate" from="0 6" to="0 0" dur=".4s" fill="freeze" begin=".45s" calcMode="spline" keyTimes="0;1" keySplines=".4 0 .2 1" additive="sum"/>
  <animate attributeName="opacity" from="0" to="1" dur=".4s" fill="freeze" begin=".45s"/>
</text>

<!-- ── Dot tick marks at outer ends (appear last) -->
<circle cx="${lx1 + 2}" cy="${lineY}" r="2" fill="${accent}" opacity="0">
  <animate attributeName="opacity" from="0" to=".5" dur=".2s" fill="freeze" begin=".55s"/>
</circle>
<circle cx="${rx2 - 2}" cy="${lineY}" r="2" fill="${accent}" opacity="0">
  <animate attributeName="opacity" from="0" to=".5" dur=".2s" fill="freeze" begin=".55s"/>
</circle>
</svg>`
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const text = (p.get('text') ?? p.get('t') ?? 'Section').trim().slice(0, 40)
  const cKey = (p.get('color') ?? p.get('c') ?? 'blue').toLowerCase()
  const theme = THEMES[cKey] ?? THEMES.blue

  return new NextResponse(buildSvg(text, theme), {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}