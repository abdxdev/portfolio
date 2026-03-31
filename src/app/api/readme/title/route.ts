// app/api/readme-title/route.ts
//
// Animated cycling SVG for GitHub READMEs — pure SMIL, no JS, GitHub-safe.
//
// Usage (cycling):
//   ?items=HI+THERE,I%27M,Abdul+Rahman,AKA+ABDXDEV&color=teal
//
// Usage (single, backward compat):
//   ?text=Projects&color=blue
//
// Params:
//   items / i  — comma-separated labels (max 10, each max 40 chars)
//   text  / t  — single label (backward compat)
//   color / c  — blue | purple | green | amber | pink | teal  (default: blue)
//
// Animation model:
//   • Intro (plays once): item 0 fades in over ENTER_S, all items hold for
//     HOLD_S then glitch-scramble into the next. Decorators freeze after item 0 enter.
//   • Loop (repeats): same slot structure but no enter animation. Items cycle
//     indefinitely with glitch-scramble transitions only.
//   • SVG width fixed to longest label + 1 space each side.

import { NextRequest, NextResponse } from 'next/server'

// ── Themes ────────────────────────────────────────────────────────────────────
const THEMES = {
  blue: { accent: '#60a5fa', dim: '#1e3a5f' },
  purple: { accent: '#c4b5fd', dim: '#3b1f6e' },
  green: { accent: '#6ee7b7', dim: '#064e3b' },
  amber: { accent: '#fcd34d', dim: '#78350f' },
  pink: { accent: '#f9a8d4', dim: '#831843' },
  teal: { accent: '#5eead4', dim: '#134e4a' },
} satisfies Record<string, { accent: string; dim: string }>
type Theme = typeof THEMES.blue

// ── Layout constants ──────────────────────────────────────────────────────────
const FONT = "'Cascadia Code','Fira Code','JetBrains Mono',monospace"
const FS = 22
const CHAR_W = 13.25
const H = 56
const LINE_MRG = 20
const LINE_GAP = 12
const D = 4

// ── Timing (seconds) ─────────────────────────────────────────────────────────
const ENTER_S = 0.50
const HOLD_S = 2.00
const GLITCH_S = 0.36
const N_FRAMES = 9
const FRAME_S = GLITCH_S / N_FRAMES

// Each item in the intro: item 0 = ENTER + HOLD + GLITCH, rest = HOLD + GLITCH
// Each item in the loop: HOLD + GLITCH (no enter ever)
const SLOT_S = HOLD_S + GLITCH_S   // 2.36 s — used for both loop slots and intro slots i>0

function introTotal(N: number): number { return ENTER_S + N * SLOT_S }
function introItemStart(i: number): number { return ENTER_S + i * SLOT_S }
// item 0 becomes visible at t=ENTER_S (after fade-in), others at their slot start
function introItemVisible(i: number): number { return ENTER_S + i * SLOT_S }

function loopTotal(N: number): number { return N * SLOT_S }
function loopItemStart(i: number): number { return i * SLOT_S }

// ── Glitch characters ─────────────────────────────────────────────────────────
const POOL = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function seededChar(seed: number): string {
  return POOL[Math.abs((seed * 2654435761) >>> 0) % POOL.length]
}

function scrambleFrame(a: string, b: string, progress: number, seed: number): string {
  const len = Math.max(a.length, b.length)
  let out = ''
  for (let ci = 0; ci < len; ci++) {
    const ca = a[ci] ?? ' '
    const cb = b[ci] ?? ' '
    if (ca === cb) { out += ca; continue }
    const threshold = ci / len
    if (progress >= threshold) {
      out += (Math.abs(((seed + ci) * 1597) >>> 0) % 10 < 3) ? seededChar(seed + ci * 7) : cb
    } else {
      out += seededChar(seed + ci * 13 + Math.floor(progress * 100))
    }
  }
  return out
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function esc(s: string): string {
  return s.replace(/[<>&"']/g, c =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!))
}

function fp(n: number, d = 5): string { return n.toFixed(d) }

// Emit a SMIL values= + keyTimes= pair from an array of [t, v] absolute-second
// samples. `T` is the total animation duration for normalisation.
// Guarantees strictly increasing keyTimes and bookend 0/1 entries.
function timeline(samples: [number, number][], T: number): { kt: string; v: string } {
  // clamp times to [0, T] and normalise
  let pts = samples.map(([t, v]) => [Math.max(0, Math.min(1, t / T)), v] as [number, number])

  // sort
  pts.sort((a, b) => a[0] - b[0])

  // deduplicate: keep first occurrence of each keyTime
  const seen = new Set<string>()
  pts = pts.filter(([k]) => {
    const key = k.toFixed(8)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // ensure 0 and 1 bookends
  if (pts[0][0] > 0) pts.unshift([0, pts[0][1]])
  if (pts[pts.length - 1][0] < 1) pts.push([1, pts[pts.length - 1][1]])

  return {
    kt: pts.map(([k]) => fp(k, 6)).join(';'),
    v: pts.map(([, v]) => v.toFixed(3)).join(';'),
  }
}

// ── Intro opacity builders ────────────────────────────────────────────────────

/** Main text for item i during the intro.
 *  - i=0: fades 0→1 over ENTER_S, holds, drops to 0 at hold end.
 *  - i>0: snaps to 1 at its slot start, holds, drops to 0 at hold end.
 *  - ALL items (including last) freeze at 0 — the loop animate for item 0
 *    starts visible and handles the seamless continuation. */
function introTextOp(i: number, N: number): { kt: string; v: string } {
  const T = introTotal(N)
  const vis = introItemVisible(i)
  const holdEnd = vis + HOLD_S

  const samples: [number, number][] = i === 0
    ? [
      [0, 0],
      [ENTER_S, 1],
      [holdEnd, 1],
      [holdEnd + 1e-4, 0],
      [T, 0],
    ]
    : [
      [0, 0],
      [vis - 1e-4, 0],
      [vis, 1],
      [holdEnd, 1],
      [holdEnd + 1e-4, 0],
      [T, 0],
    ]

  return timeline(samples, T)
}

/** Glitch frame f of transition i→(i+1) during the intro. */
function introGlitchOp(i: number, N: number, f: number): { kt: string; v: string } {
  const T = introTotal(N)
  const holdEnd = introItemVisible(i) + HOLD_S
  const frameOn = holdEnd + f * FRAME_S
  const frameOff = frameOn + FRAME_S

  return timeline([
    [0, 0],
    [frameOn - 1e-4, 0],
    [frameOn, 1],
    [frameOff, 1],
    [frameOff + 1e-4, 0],
    [T, 0],
  ], T)
}

// ── Loop opacity builders ─────────────────────────────────────────────────────

/** Main text for item i during the loop.
 *  Slot i: [i*SLOT_S .. i*SLOT_S+HOLD_S] = visible. */
function loopTextOp(i: number, N: number): { kt: string; v: string } {
  const T = loopTotal(N)
  const slotOn = loopItemStart(i)
  const slotOff = slotOn + HOLD_S

  // item 0 is visible at the very start of the loop (handoff from intro)
  const samples: [number, number][] = i === 0
    ? [
      [0, 1],
      [slotOff, 1],
      [slotOff + 1e-4, 0],
      [T, 0],
    ]
    : [
      [0, 0],
      [slotOn - 1e-4, 0],
      [slotOn, 1],
      [slotOff, 1],
      [slotOff + 1e-4, 0],
      [T, 0],
    ]

  return timeline(samples, T)
}

/** Glitch frame f of transition i→(i+1) during the loop. */
function loopGlitchOp(i: number, N: number, f: number): { kt: string; v: string } {
  const T = loopTotal(N)
  const holdEnd = loopItemStart(i) + HOLD_S
  const frameOn = holdEnd + f * FRAME_S
  const frameOff = frameOn + FRAME_S

  return timeline([
    [0, 0],
    [frameOn - 1e-4, 0],
    [frameOn, 1],
    [frameOff, 1],
    [frameOff + 1e-4, 0],
    [T, 0],
  ], T)
}

// ── Main SVG builder ──────────────────────────────────────────────────────────
function buildSvg(items: string[], theme: Theme): string {
  const N = items.length

  const T_I = introTotal(N)
  const T_L = loopTotal(N)

  const maxLen = Math.max(...items.map(s => s.length))
  // Outer SVG: text + 1-space padding each side + generous side margin for lines
  const W = Math.ceil((maxLen + 2) * CHAR_W) + 72 * 2
  const cx = W / 2
  const cy = H / 2
  const ly = cy - 1
  // Inner dim box: text + 1 char padding each side
  const tw = Math.ceil((maxLen + 2) * CHAR_W)
  const lxi = cx - tw / 2 - LINE_GAP
  const rxi = cx + tw / 2 + LINE_GAP
  const lxo = LINE_MRG
  const rxo = W - LINE_MRG

  // Intro animate attrs — plays once, freezes
  const IA = `dur="${fp(T_I, 3)}s" fill="freeze" calcMode="linear"`
  // Loop animate attrs — starts when intro ends, repeats forever
  const LA = `dur="${fp(T_L, 3)}s" repeatCount="indefinite" calcMode="linear" begin="${fp(T_I, 3)}s"`

  // ── Gradients + filter ────────────────────────────────────────────────────
  const defs = `
  <linearGradient id="ll" x1="${fp(lxo, 1)}" y1="0" x2="${fp(lxi, 1)}" y2="0" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="${theme.accent}" stop-opacity="0"/>
    <stop offset="100%" stop-color="${theme.accent}" stop-opacity="1"/>
  </linearGradient>
  <linearGradient id="lr" x1="${fp(rxi, 1)}" y1="0" x2="${fp(rxo, 1)}" y2="0" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="${theme.accent}" stop-opacity="1"/>
    <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
  </linearGradient>
  <filter id="fg" x="-50%" y="-300%" width="200%" height="700%">
    <feGaussianBlur stdDeviation="2.5" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`

  // ── Decorators — animate once with item 0's enter, freeze forever ─────────
  // Line x1/x2 travel from inner to outer over ENTER_S.
  const lXT = timeline([[0, lxi], [ENTER_S, lxo], [T_I, lxo]], T_I)
  const rXT = timeline([[0, rxi], [ENTER_S, rxo], [T_I, rxo]], T_I)
  // Opacity ramps up over ENTER_S and stays.
  const lineFullOp = timeline([[0, 0], [ENTER_S, 1], [T_I, 1]], T_I)
  const lineGlowOp = timeline([[0, 0], [ENTER_S, 0.5], [T_I, 0.5]], T_I)
  const dimOp = timeline([[0, 0], [ENTER_S, 0.38], [T_I, 0.38]], T_I)
  const diaOp = timeline([[0, 0], [ENTER_S - 1e-4, 0], [ENTER_S, 1], [T_I, 1]], T_I)
  const dotOp = timeline([[0, 0], [ENTER_S - 1e-4, 0], [ENTER_S, 0.5], [T_I, 0.5]], T_I)

  const dec = `
<rect x="${fp(cx - tw / 2 - 2, 1)}" y="${fp(cy - FS / 2 - 4, 1)}" width="${fp(tw + 4, 1)}" height="${FS + 8}" rx="4" fill="${theme.dim}" opacity="0">
  <animate attributeName="opacity" values="${dimOp.v}" keyTimes="${dimOp.kt}" ${IA}/>
</rect>
<line x1="${fp(lxi, 1)}" y1="${fp(ly, 1)}" x2="${fp(lxi, 1)}" y2="${fp(ly, 1)}" stroke="url(#ll)" stroke-width="3" stroke-linecap="round" opacity="0">
  <animate attributeName="x1"      values="${lXT.v}"      keyTimes="${lXT.kt}"      ${IA}/>
  <animate attributeName="opacity" values="${lineGlowOp.v}" keyTimes="${lineGlowOp.kt}" ${IA}/>
</line>
<line x1="${fp(lxi, 1)}" y1="${fp(ly, 1)}" x2="${fp(lxi, 1)}" y2="${fp(ly, 1)}" stroke="url(#ll)" stroke-width="1.5" stroke-linecap="round" opacity="0">
  <animate attributeName="x1"      values="${lXT.v}"      keyTimes="${lXT.kt}"      ${IA}/>
  <animate attributeName="opacity" values="${lineFullOp.v}" keyTimes="${lineFullOp.kt}" ${IA}/>
</line>
<line x1="${fp(rxi, 1)}" y1="${fp(ly, 1)}" x2="${fp(rxi, 1)}" y2="${fp(ly, 1)}" stroke="url(#lr)" stroke-width="3" stroke-linecap="round" opacity="0">
  <animate attributeName="x2"      values="${rXT.v}"      keyTimes="${rXT.kt}"      ${IA}/>
  <animate attributeName="opacity" values="${lineGlowOp.v}" keyTimes="${lineGlowOp.kt}" ${IA}/>
</line>
<line x1="${fp(rxi, 1)}" y1="${fp(ly, 1)}" x2="${fp(rxi, 1)}" y2="${fp(ly, 1)}" stroke="url(#lr)" stroke-width="1.5" stroke-linecap="round" opacity="0">
  <animate attributeName="x2"      values="${rXT.v}"      keyTimes="${rXT.kt}"      ${IA}/>
  <animate attributeName="opacity" values="${lineFullOp.v}" keyTimes="${lineFullOp.kt}" ${IA}/>
</line>
<g filter="url(#fg)" opacity="0">
  <polygon points="${fp(lxi, 1)},${fp(ly - D, 1)} ${fp(lxi + D, 1)},${fp(ly, 1)} ${fp(lxi, 1)},${fp(ly + D, 1)} ${fp(lxi - D, 1)},${fp(ly, 1)}" fill="${theme.accent}"/>
  <animate attributeName="opacity" values="${diaOp.v}" keyTimes="${diaOp.kt}" ${IA}/>
</g>
<g filter="url(#fg)" opacity="0">
  <polygon points="${fp(rxi, 1)},${fp(ly - D, 1)} ${fp(rxi + D, 1)},${fp(ly, 1)} ${fp(rxi, 1)},${fp(ly + D, 1)} ${fp(rxi - D, 1)},${fp(ly, 1)}" fill="${theme.accent}"/>
  <animate attributeName="opacity" values="${diaOp.v}" keyTimes="${diaOp.kt}" ${IA}/>
</g>
<circle cx="${fp(lxo + 2, 1)}" cy="${fp(ly, 1)}" r="2" fill="${theme.accent}" opacity="0">
  <animate attributeName="opacity" values="${dotOp.v}" keyTimes="${dotOp.kt}" ${IA}/>
</circle>
<circle cx="${fp(rxo - 2, 1)}" cy="${fp(ly, 1)}" r="2" fill="${theme.accent}" opacity="0">
  <animate attributeName="opacity" values="${dotOp.v}" keyTimes="${dotOp.kt}" ${IA}/>
</circle>`

  // ── Text + glitch frames ───────────────────────────────────────────────────
  const textEls = items.map((item, i) => {
    const next = items[(i + 1) % N]
    const iOp = introTextOp(i, N)
    const lOp = loopTextOp(i, N)

    const frames = Array.from({ length: N_FRAMES }, (_, f) =>
      scrambleFrame(item, next, f / (N_FRAMES - 1), (i * 1000 + f * 37) | 0)
    )

    const glitch = frames.map((frame, f) => {
      const ig = introGlitchOp(i, N, f)
      const lg = loopGlitchOp(i, N, f)
      return `<text x="${fp(cx, 1)}" y="${fp(cy + 1, 1)}" text-anchor="middle" dominant-baseline="central" font-family="${FONT}" font-size="${FS}" font-weight="500" letter-spacing=".03em" fill="#e6edf3" opacity="0">${esc(frame)}<animate attributeName="opacity" values="${ig.v}" keyTimes="${ig.kt}" ${IA}/><animate attributeName="opacity" values="${lg.v}" keyTimes="${lg.kt}" ${LA}/></text>`
    }).join('\n')

    return `<!-- [${i}] ${esc(item)} -->
<text x="${fp(cx, 1)}" y="${fp(cy + 1, 1)}" text-anchor="middle" dominant-baseline="central" font-family="${FONT}" font-size="${FS}" font-weight="500" letter-spacing=".03em" fill="#e6edf3" opacity="0">${esc(item)}<animate attributeName="opacity" values="${iOp.v}" keyTimes="${iOp.kt}" ${IA}/><animate attributeName="opacity" values="${lOp.v}" keyTimes="${lOp.kt}" ${LA}/></text>
${glitch}`
  }).join('\n')

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>${defs}</defs>
<rect width="${W}" height="${H}" rx="10" fill="#0d1117"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="9.5" stroke="#161b22" stroke-width="1"/>
${dec}
${textEls}
</svg>`
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams

  const rawItems = p.get('items') ?? p.get('i')
  const rawText = p.get('text') ?? p.get('t')

  let items: string[]
  if (rawItems) {
    items = rawItems.split(',').map(s => s.trim()).filter(Boolean).slice(0, 10)
  } else if (rawText) {
    items = [rawText.trim()]
  } else {
    items = ['Section']
  }
  items = items.map(s => s.slice(0, 40)).filter(Boolean)
  if (items.length === 0) items = ['Section']

  const cKey = (p.get('color') ?? p.get('c') ?? 'blue').toLowerCase()
  const theme = THEMES[cKey as keyof typeof THEMES] ?? THEMES.blue

  return new NextResponse(buildSvg(items, theme), {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}