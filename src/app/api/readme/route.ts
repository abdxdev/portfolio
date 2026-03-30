import { ASSETS_URL, METRICS_URL, SITE_DOMAIN, SITE_URL } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
// import { FaGlobe, FaLinkedin } from "react-icons/fa";
// import { IoMdMail } from "react-icons/io";
// import { FaRegNewspaper } from "react-icons/fa6";

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

function mdBadge({ label = "", message = "", color = "080808", logo, logoColor = "ffffff", style = "for-the-badge", labelColor }: BadgeOptions): string {
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
    contacts: [
      f.linkedin_username && mdLink(mdImage("LinkedIn", `${ASSETS_URL}/icons/linkedin.svg`), "https://linkedin.com/in/" + f.linkedin_username),
      f.email && mdLink(mdImage("Email", `${ASSETS_URL}/icons/email.svg`), "mailto:" + f.email),
      f.portfolio && mdLink(mdImage("Portfolio", `${ASSETS_URL}/icons/portfolio.svg`), f.portfolio),
      f.resume && mdLink(mdImage("Resume", `${ASSETS_URL}/icons/resume.svg`), f.resume),
    ].filter(Boolean).join(" "),
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
  const [portfolio, description] = await Promise.all([
    fetch(`${SITE_URL}/api/portfolio?fetch=true`).then((r) => r.json()),
    fetchStaticAsset(SITE_URL + "/assets/md/description.md"),
  ]);

  const now = new Date().toISOString().replace("T", " ").split(".")[0] + " UTC";
  const updateBadge = mdBadge({ label: "Click to Update", message: `Last Updated: ${now}`, color: "080808" });

  const parts: { text: string; centered: boolean; summary: string; sep: string }[] = [];
  const p = (text: string, { centered = true, summary = "", sep = "\n\n" }: { centered?: boolean; summary?: string; sep?: string } = {}) => {
    parts.push({ text: text.trim(), centered, summary, sep });
  };

  p(mdLink(mdImage("Abd Dev", `${ASSETS_URL}/gif/intro.gif`), SITE_URL));
  p(description);
  console.log("portfolio.subtitles:", portfolio.subtitles);
  p(mdImage("Subtitles Marquee", `${SITE_URL}/api/readme/subtitles?width=860&height=48`));
  p(`Portfolio: **${mdLink(SITE_DOMAIN, SITE_URL)}**`);
  p(`Resume: **${mdLink(SITE_DOMAIN + "/resume", SITE_URL + "/resume")}**`);

  p(mdImage("Languages & Tools", `${ASSETS_URL}/titles/languages_and_tools.png`));
  p("*click see more to view all skills*");
  p(getFeaturedSkills(portfolio.skills));
  // p(mdImage("GitHub Stats", `${METRICS_URL}/languages.svg`));
  p(getAllSkills(portfolio.skills), { centered: false, summary: "See more skills" });

  p(mdImage("Featured Projects", `${ASSETS_URL}/titles/featured_projects.png`));
  p("*click see more to view all projects*");
  p(getProjectsGallery(portfolio.projects));
  p(getProjectsList(portfolio.projects), { centered: false, summary: "See more projects" });

  p(mdImage("Anime List", `${ASSETS_URL}/titles/anime_list.png`));
  p('*you reek of not having watched enough anime*');
  // p(mdLink(mdImage("Anime Stats", `${METRICS_URL}/anilist.svg`), portfolio.anilist_url));
  // p(`<img align='right' src='${ASSETS_URL}/gif/anime_gif.gif' height='170'>`, { centered: false });
  p(getAnime(portfolio.anime), { centered: false });

  p(mdImage("Game List", `${ASSETS_URL}/titles/game_list.png`));
  p("*git commit -m 'died again'*");
  p(getGames(portfolio.games), { centered: false });

  p(mdImage("Meet my Code Buddies!", `${ASSETS_URL}/titles/friends.png`));
  p("*Giga Nigas*");
  p(getFriends(portfolio.friends));
  // p(mdImage("Support Me", `${ASSETS_URL}/titles/support_me.png`));
  // p("Help me keep my work open source and free for everyone—because the world needs more free stuff (and less paywalls).");
  // p(mdLink(mdImage("Buy me a coffee", mdBadge({ message: "Buy me a coffee", color: "ffdd00", logo: "buymeacoffee", logoColor: "000000", style: "for-the-badge" })), "https://www.buymeacoffee.com/abdbbdii"));

  p('---')
  p(`[![Click to Update](${updateBadge})](${SITE_URL}/update-readme)`);
  p("_This GitHub profile is auto-generated. If you want to update it, click the button above._");
  p(mdImage("Footer", `${ASSETS_URL}/svg/footer.svg`));

  let out = "";
  let isCentered = false;

  for (const part of parts) {
    if (part.centered && !isCentered) {
      out += '<div align="center">\n\n';
      isCentered = true;
    } else if (!part.centered && isCentered) {
      out += '</div>\n\n';
      isCentered = false;
    }

    if (part.summary) out += `<details><summary>${part.summary}</summary>\n\n`;
    out += part.text + (part.text ? part.sep : "");
    if (part.summary) out += "</details>\n\n";
  }

  if (isCentered) {
    out += '</div>\n\n';
  }

  return new NextResponse(out.trim(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}