import { NextResponse } from 'next/server';
import skillsData from '@/data/skills.json';
import skillsSchema from '@/data/skills-schema.json';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

const TITLE_TO_SLUG_REPLACEMENTS: { [key: string]: string } = {
  '+': 'plus', '.': 'dot', '&': 'and', đ: 'd', ħ: 'h', ı: 'i',
  ĸ: 'k', ŀ: 'l', ł: 'l', ß: 'ss', ŧ: 't', ø: 'o'
};
const TITLE_TO_SLUG_CHARS_REGEX = new RegExp(
  `[${Object.keys(TITLE_TO_SLUG_REPLACEMENTS).join('')}]`, 'g'
);
const TITLE_TO_SLUG_RANGE_REGEX = /[^a-z\d]/g;

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replaceAll(TITLE_TO_SLUG_CHARS_REGEX, char => TITLE_TO_SLUG_REPLACEMENTS[char])
    .normalize('NFD')
    .replace(TITLE_TO_SLUG_RANGE_REGEX, '');
}

type OneOfEntry = {
  properties: {
    name: { const: string };
    hex?: { const: string };
    portfolio: { type: 'boolean' };
  };
};

type SkillsSchema = {
  items: {
    properties: {
      skills: { items: { oneOf: OneOfEntry[] } };
    };
  };
};

interface SvglResponse {
  id: number;
  title: string;
  category: string | string[];
  route: string | { light: string; dark: string };
  url: string;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000;
interface CacheEntry {
  data: SvglResponse[];
  timestamp: number;
}
let svglIconsCache: CacheEntry | null = null;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry<T>(
  url: string,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.get<T>(url);
      return response.data;
    } catch (error: unknown) {
      lastError = error;

      if (axios.isAxiosError(error) && error.response?.status !== 429) {
        throw error;
      }

      if (attempt === maxRetries - 1) {
        throw error;
      }

      await sleep(delay);
      delay *= 2;
    }
  }

  throw lastError;
}

async function fetchAllSvglIcons(): Promise<SvglResponse[]> {
  if (svglIconsCache && (Date.now() - svglIconsCache.timestamp) < CACHE_DURATION) {
    return svglIconsCache.data;
  }

  try {
    const data = await fetchWithRetry<SvglResponse[]>('https://api.svgl.app/');
    svglIconsCache = {
      data,
      timestamp: Date.now()
    };
    return data;
  } catch (error) {
    if (svglIconsCache?.data) {
      console.warn('Using stale cache data due to API error:', error);
      return svglIconsCache.data;
    }
    console.error('Error fetching SVGL icons:', error);
    return [];
  }
}

function getIconRoute(route: string | { light: string; dark: string }): string {
  if (typeof route === 'string') return route;
  return route.light;
}

async function fetchSvglIcon(name: string): Promise<string | null> {
  try {
    const allIcons = await fetchAllSvglIcons();
    if (!allIcons.length) {
      console.warn(`Unable to fetch icons for ${name}, API may be unavailable`);
      return null;
    }

    const originalName = name.toLowerCase();
    
    const exactMatch = allIcons.find(item => 
      item.title.toLowerCase() === originalName
    );
    
    if (exactMatch) {
      return getIconRoute(exactMatch.route);
    }

    const partialMatch = allIcons.find(item => {
      const itemTitle = item.title.toLowerCase();
      return itemTitle.includes(originalName) || originalName.includes(itemTitle);
    });

    if (partialMatch) {
      return getIconRoute(partialMatch.route);
    }

    console.warn(`No SVGL icon found for ${name}`);
  } catch (error) {
    console.error(`Error in SVGL icon lookup for ${name}:`, error);
  }
  return null;
}

async function findCustomLogo(name: string): Promise<string | null> {
  try {
    const customLogosPath = path.join(process.cwd(), 'src', 'data', 'custom_logos');
    const files = await fs.readdir(customLogosPath);
    const slugName = titleToSlug(name);

    const matchingFile = files.find(file =>
      file.toLowerCase().includes(slugName) && file.endsWith('.svg')
    );

    if (matchingFile) {
      const filePath = path.join(customLogosPath, matchingFile);
      const svg = await fs.readFile(filePath, 'utf-8');
      return svg;
    }
  } catch (error) {
    console.error(`Error reading custom logo for ${name}:`, error);
  }
  return null;
}

export async function GET() {
  const iconMap = new Map<string, string>();
  const oneOf = (skillsSchema as unknown as SkillsSchema)
    .items.properties.skills.items.oneOf;
  oneOf.forEach(entry => {
    const name = entry.properties.name.const;
    const hexConst = entry.properties.hex?.const ?? null;
    if (hexConst !== null) {
      iconMap.set(name, hexConst);
    }
  });

  const enriched = await Promise.all(skillsData.map(async category => ({
    ...category,
    skills: await Promise.all(category.skills.map(async skill => {
      const slug = titleToSlug(skill.name);
      const hex = iconMap.get(skill.name) || null;
      let svg_url: string | null = null;

      if (hex) {
        svg_url = `https://cdn.simpleicons.org/${slug}/${hex}`;
      } else {
        const customSvg = await findCustomLogo(skill.name);
        if (customSvg) {
          svg_url = `/data/custom_logos/${slug}.svg`;
        } else {
          svg_url = await fetchSvglIcon(skill.name);
        }
      }

      return {
        ...skill,
        slug,
        hex,
        svg_url
      };
    }))
  })));

  return NextResponse.json(enriched);
}
