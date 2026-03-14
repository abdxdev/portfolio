import { SITE_URL, SITE_NAME, FROM_DISPLAY } from "@/lib/constants";

const BASE_STYLES = {
  body: `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#f4f4f5;`,
  wrapper: `max-width:560px;margin:40px auto;background:#ffffff;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);`,
  header: `background:#09090b;padding:24px 32px;`,
  body_pad: `padding:32px;`,
  footer: `padding:20px 32px;background:#f4f4f5;border-top:1px solid #e4e4e7;`,
  label: `margin:0 0 4px;font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:.07em;`,
  value: `margin:0;font-size:15px;color:#09090b;`,
  divider: `border:none;border-top:1px solid #e4e4e7;margin:24px 0;`,
  meta: `margin:0;font-size:12px;color:#a1a1aa;`,
  link: `color:#a1a1aa;text-decoration:none;`,
};

export function emailLayout(content: string, preview?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  ${preview ? `<meta name="x-preview" content="${preview}" />` : ""}
  <title>${FROM_DISPLAY}</title>
</head>
<body style="${BASE_STYLES.body}">
  <div style="${BASE_STYLES.wrapper}">

    <!-- Header -->
    <div style="${BASE_STYLES.header}">
      <a href="${SITE_URL}" style="text-decoration:none;">
        <span style="font-size:16px;font-weight:700;color:#ffffff;">${SITE_NAME}</span>
        <span style="font-size:16px;color:#52525b;">.vercel.app</span>
      </a>
    </div>

    <!-- Body -->
    <div style="${BASE_STYLES.body_pad}">
      ${content}
    </div>

    <!-- Footer -->
    <div style="${BASE_STYLES.footer}">
      <p style="${BASE_STYLES.meta}">
        Sent from
        <a href="${SITE_URL}" style="${BASE_STYLES.link}">${SITE_URL}</a>
        &nbsp;·&nbsp;
        <a href="mailto:${FROM_DISPLAY}" style="${BASE_STYLES.link}">${FROM_DISPLAY}</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

/** Labelled row used inside email bodies */
export function emailRow(label: string, valueHtml: string, topBorder = true): string {
  return `
  <div style="margin-bottom:20px;${topBorder ? "padding-top:20px;border-top:1px solid #e4e4e7;" : ""}">
    <p style="${BASE_STYLES.label}">${label}</p>
    <div style="${BASE_STYLES.value}">${valueHtml}</div>
  </div>`;
}

export function emailDivider(): string {
  return `<hr style="${BASE_STYLES.divider}" />`;
}

export function emailH1(text: string): string {
  return `<h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-.02em;">${text}</h1>`;
}

export function emailP(html: string, muted = false): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${muted ? "#71717a" : "#09090b"};">${html}</p>`;
}

export function emailButton(label: string, href: string): string {
  return `
  <a href="${href}" style="display:inline-block;margin-top:8px;padding:10px 20px;background:#09090b;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
    ${label}
  </a>`;
}