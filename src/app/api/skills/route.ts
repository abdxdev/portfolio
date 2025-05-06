import { NextResponse } from 'next/server';
import skillsData from '@/data/skills.json';
import simpleIconsData from '@/data/simple-icons.json';

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

export async function GET() {
  const iconMap = new Map<string, string>();
  simpleIconsData.forEach(item => {
    const key = titleToSlug(item.title);
    iconMap.set(key, item.hex);
  });
  const enriched = skillsData.map(category => ({
    ...category,
    skills: category.skills.map(skill => {
      const slug = titleToSlug(skill.name);
      const hex = iconMap.get(slug) || null;
      const svg = hex ? `https://cdn.simpleicons.org/${slug}/${hex}` : null;
      return { ...skill, slug, hex, svg };
    })
  }));
  return NextResponse.json(enriched);
}
