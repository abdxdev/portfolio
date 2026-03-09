import { NextRequest, NextResponse } from "next/server";

// ─── Helpers ────────────────────────────────────────────────────────────────

function shortString(text: string, max = 20): string {
  if (text.length > max) return text.slice(0, max - 5) + "..." + text.slice(-5);
  return text;
}

function listDictToListList(data: Record<string, unknown>[]): string[][] {
  if (!data.length) return [];
  const headers = Object.keys(data[0]);
  const formatValue = (v: unknown) =>
    Array.isArray(v) ? v.map(String).join(" ") : String(v);
  return [headers, ...data.map((item) => headers.map((h) => formatValue(item[h])))];
}

// ─── Markdown primitives ────────────────────────────────────────────────────

function mdTable(data: string[][], centered = false, header = true): string {
  if (!data.length) return "";
  const head = `| ${data[0].join(" | ")} |\n`;
  const sep = `| ${data[0].map(() => (centered ? ":---:" : "---")).join(" | ")} |\n`;
  const rows = data.slice(1).map((r) => `| ${r.join(" | ")} |`).join("\n");
  return header ? head + sep + rows : head + rows;
}

function getGalleryView(items: Record<string, string>[], columns: number): string {
  const chunks: string[][] = [];
  for (let i = 0; i < items.length; i += columns) {
    const slice = items.slice(i, i + columns);
    const keys = Object.keys(items[i]);
    for (const key of keys) {
      chunks.push(slice.map((item) => item[key]));
    }
  }
  return mdTable(chunks, true);
}

function mdImage(alt: string, src: string) {
  return `![${alt}](<${src}>)`;
}
function mdHtmlImage(alt: string, src: string, width = 20) {
  return `<img src="${src}" alt="${alt}" width="${width}">`;
}
function mdLink(text: string, url: string) {
  return `[${text}](${url})`;
}
function mdHtmlLink(text: string, url: string) {
  return `<a href="${url}" target="_blank">${text}</a>`;
}

interface BadgeOptions {
  label?: string;       // left side label (optional)
  message: string;      // right side message
  color?: string;       // hex without #, or named color (default: "080808")
  logo?: string;        // simple-icons slug
  logoColor?: string;   // hex without # (default: "ffffff")
  style?: "flat" | "flat-square" | "for-the-badge" | "plastic" | "social";
  labelColor?: string;  // hex without #
}

function skillNameToSlug(name: string): string {
  // Derive a simple-icons compatible slug from a skill name.
  // Handles common cases: lowercased, spaces/dots/# removed, known overrides.
  const overrides: Record<string, string> = {
    "c++": "cplusplus",
    "c#": "csharp",
    ".net": "dotnet",
    "node.js": "nodedotjs",
    "express.js": "express",
    "next.js": "nextdotjs",
    "tailwind css": "tailwindcss",
    "html5": "html5",
    "github workflows": "githubactions",
    "microsoft azure": "microsoftazure",
    "microsoft sql server": "microsoftsqlserver",
    "davinci resolve": "davinciresolve",
    "after effects": "adobeaftereffects",
    "premiere pro": "adobepremierepro",
    "illustrator": "adobeillustrator",
    "photoshop": "adobephotoshop",
    "latex": "latex",
    "tex": "latex",
  };
  const lower = name.toLowerCase();
  return overrides[lower] ?? lower.replace(/[^a-z0-9]/g, "");
}

function mdBadge({ label, message, color = "080808", logo, logoColor = "ffffff", style = "for-the-badge", labelColor }: BadgeOptions): string {
  // shields.io path encoding: spaces → "_", hyphens → "--", underscores → "__"
  const encode = (s: string) =>
    encodeURIComponent(s.replace(/-/g, "--").replace(/_/g, "__").replace(/ /g, "_"));
  // path format: /badge/{label}-{message}-{color}  or  /badge/{message}-{color}
  const path = label
    ? `${encode(label)}-${encode(message)}-${color}`
    : `${encode(message)}-${color}`;
  const params = new URLSearchParams({ style });
  if (logo) { params.set("logo", logo); params.set("logoColor", logoColor); }
  if (labelColor) params.set("labelColor", labelColor);
  return `https://img.shields.io/badge/${path}?${params}`;
}

// ─── Centered / collapsible wrapper ─────────────────────────────────────────

function write(
  text: string,
  {
    centered = true,
    summary = "",
    sep = "\n\n",
  }: { centered?: boolean; summary?: string; sep?: string } = {}
): string {
  let out = "";
  if (centered) out += '<div align="center">\n\n';
  if (summary) out += `<details><summary>${summary}</summary>\n\n`;
  out += text.trim() + sep;
  if (summary) out += "</details>\n\n";
  if (centered) out += "</div>\n\n";
  return out;
}

// ─── Section builders ───────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAnime(animelist: any[]): string {
  const grouped: Record<string, { Title: string; Poster: string }[]> = {};
  for (const anime of animelist) {
    const status: string = anime.status;
    if (!grouped[status]) grouped[status] = [];
    grouped[status].push({
      Title: shortString(anime.title, 20),
      Poster: `[![${anime.title}](${anime.cover_image})](${anime.site_url})`,
    });
  }
  let md = "";
  function toTitleCase(str: string) {
    return str
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
  }
  for (const [category, items] of Object.entries(grouped)) {
    const table = getGalleryView(items, 4);
    md += write(table, {
      centered: false,
      summary: toTitleCase(category),
    });
  }
  return md.trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getGames(games: any[]): string {
  const grouped: Record<string, { Title: string; Poster: string }[]> = {};
  for (const game of games) {
    const status: string = game.status;
    if (!grouped[status]) grouped[status] = [];
    grouped[status].push({
      Title: shortString(game.name, 20),
      Poster: `[![${game.name}](${game.background_image_cropped})](${game.rawg_link})`,
    });
  }
  let md = "";
  for (const [category, items] of Object.entries(grouped)) {
    const table = getGalleryView(items, 3);
    md += write(table, {
      centered: false,
      summary: category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    });
  }
  return md.trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFriends(friends: any[]): string {
  const formatted = friends.map((f) => ({
    Name: f.github_name,
    Avatar: mdLink(mdImage(f.github_name, f.github_avatar), f.github_url),
    Link: mdLink("@" + f.github_username, f.github_url),
  }));
  return getGalleryView(formatted, 3);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getProjectsList(projects: any[]): string {
  const formatted: Record<string, string>[] = [];
  for (const project of projects) {
    let priority: number = project.priority != null ? project.priority : Infinity;
    const prefix: string[] = [];
    // if (priority === 0) prefix.push("⭐");
    if (project.is_university_project) prefix.push("`UNI`");
    if (project.working_on) { prefix.push("`WIP`"); priority = 0; }
    if (priority !== 0 || project.working_on) {
      formatted.push({
        Name: (prefix.length ? prefix.join(" ") + " " : "") + `**${mdLink(project.title, project.html_url)}**`,
        Description: project.description.trim() + (project.homepage ? ` \\| ${mdLink("🌐", project.homepage)} ` : ""),
        Created: project.created_at.split("T")[0].slice(0, 4),
        _working_on: project.working_on ? "1" : "0",
      });
    }
  }
  formatted.sort((a, b) => Number(b._working_on) - Number(a._working_on));
  for (const p of formatted) delete p._working_on;
  return mdTable(listDictToListList(formatted));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getProjectsGallery(projects: any[]): string {
  const formatted: Record<string, string>[] = [];
  for (const project of projects) {
    let priority: number = project.priority != null ? project.priority : Infinity;
    const prefix: string[] = [];
    // if (priority === 0) prefix.push("⭐");
    if (project.is_university_project) prefix.push("`UNI`");
    if (project.working_on) { prefix.push("`WIP`"); priority = 0; }
    if (priority === 0 && !project.working_on) {
      const image = project.thumbnails?.length > 0 ? project.thumbnails[0] : project.default_image_url;
      formatted.push({
        Thumbnail: mdHtmlLink(mdHtmlImage(project.title, image, 300), project.html_url),
        Name: (prefix.length ? prefix.join(" ") + " " : "") + `**${mdLink(project.title, project.html_url)}**` + (project.homepage ? ` ${mdLink("🌐", project.homepage)} ` : ""),
        Description: project.description.trim(),
      });
    }
  }
  return getGalleryView(formatted, 3);
}

function hsvToHex(h: number, s: number, v: number): string {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r: number, g: number, b: number;
  switch (i % 6) {
    case 0: [r, g, b] = [v, t, p]; break;
    case 1: [r, g, b] = [q, v, p]; break;
    case 2: [r, g, b] = [p, v, t]; break;
    case 3: [r, g, b] = [p, q, v]; break;
    case 4: [r, g, b] = [t, p, v]; break;
    default: [r, g, b] = [v, p, q];
  }
  return [r, g, b].map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAllSkills(skillsSets: any[]): string {
  const totalY = skillsSets.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = skillsSets.map((categoryData: any, y: number) => {
    const totalX = categoryData.skills.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tools = categoryData.skills.map((skill: any, x: number) => {
      const hue = (y * totalX + x) / (totalX * totalY || 1);
      const color = hsvToHex(hue, 0.6, 0.9);
      return mdImage(skill.name, mdBadge({ message: skill.name, color, logo: skillNameToSlug(skill.name) }));
    });
    return { Category: categoryData.category, Tools: tools };
  });
  return mdTable(listDictToListList(rows));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFeaturedSkills(skillsSets: any[]): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const featured = skillsSets.flatMap((c: any) => c.skills.filter((s: any) => s.portfolio));
  const total = featured.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return featured.map((skill: any, i: number) => {
    const hue = total > 1 ? i / (total - 1) : 0;
    const color = hsvToHex(hue, 0.6, 0.9);
    return mdImage(skill.name, mdBadge({ message: skill.name, color, logo: skillNameToSlug(skill.name) }));
  }).join(" ");
}

async function fetchStaticAsset(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) return "";
  return (await res.text()).trim();
}

// ─── Main handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const BASE = `${origin}/assets/md/`;
  const assets_url = "https://raw.githubusercontent.com/abdxdev/portfolio/refs/heads/main/public/assets";
  const metrics_url = "https://raw.githubusercontent.com/abdxdev/abdxdev/refs/heads/main/metrics";

  const [portfolio, description, githubStats, anilist, supportme, footer] = await Promise.all([
    fetch(`${origin}/api/portfolio?fetch=true`).then((r) => r.json()),
    fetchStaticAsset(BASE + "description.md"),
    fetchStaticAsset(BASE + "github_stats.md"),
    fetchStaticAsset(BASE + "anilist.md"),
    fetchStaticAsset(BASE + "supportme.md"),
    fetchStaticAsset(BASE + "footer.md"),
  ]);

  const now = new Date().toISOString().replace("T", " ").split(".")[0] + " UTC";

  const parts: string[] = [];
  const p = (text: string, opts?: Parameters<typeof write>[1]) => parts.push(write(text, opts));

  p(mdLink(mdImage("Abd Dev", `${assets_url}/gif/intro.gif`), origin));
  p(description);
  p(`### **[${origin.replace("https://", "").replace("http://", "")}](${origin})**`);

  p(mdImage("Languages & Tools", `${assets_url}/titles/languages_and_tools.png`));
  p(getFeaturedSkills(portfolio.skills));
  p(mdImage("GitHub Stats", `${metrics_url}/languages.svg`));
  p(getAllSkills(portfolio.skills), { centered: false, summary: "See more skills" });

  p(mdImage("Featured Projects", `${assets_url}/titles/featured_projects.png`));
  p(getProjectsGallery(portfolio.projects));
  p(getProjectsList(portfolio.projects), { centered: false, summary: "See more projects" });

  p(mdImage("Anime List", `${assets_url}/titles/anime_list.png`));
  p('*"Planning to watch" list == "Issues" tab*');
  p(mdLink(mdImage("Anime Stats", `${metrics_url}/anilist.svg`), portfolio.anilist_url));
  p(`<img align='right' src='${assets_url}/gif/anime_gif.gif' height='170'>`, { centered: false });
  p(getAnime(portfolio.anime), { centered: false });

  p(mdImage("Game List", `${assets_url}/titles/game_list.png`));
  p("*a professional respawner*");
  p(getGames(portfolio.games), { centered: false });

  p(mdImage("Meet my Code Buddies!", `${assets_url}/titles/friends.png`));
  p(getFriends(portfolio.friends));

  p(mdImage("Support Me", `${assets_url}/titles/support_me.png`));
  p(supportme);
  p(mdLink(mdImage("Buy me a coffee", mdBadge({ message: "Buy me a coffee", color: "ffdd00", logo: "buymeacoffee", logoColor: "000000", style: "for-the-badge" })), "https://www.buymeacoffee.com/abdbbdii"));
  
  const updateBadge = mdBadge({ label: "Update", message: `Last Updated: ${now}`, color: "080808" });
  p(`[![Click to Update](${updateBadge})](${origin}/update-readme)`);
  p("_This GitHub profile is auto-generated. If you want to update it, click the button above._");
  p(mdImage("Footer", `${assets_url}/svg/footer.svg`));

  return new NextResponse(parts.join("").trim(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}