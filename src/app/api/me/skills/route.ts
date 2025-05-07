import { NextResponse } from 'next/server';
import skillsData from '@/data/skills.json';
import skillsSchema from '@/data/skills-schema.json';

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
  const enriched = skillsData.map(category => ({
    ...category,
    skills: category.skills.map(skill => {
      const slug = titleToSlug(skill.name);
      const hex = iconMap.get(skill.name) || null;
      const svg = hex ? `https://cdn.simpleicons.org/${slug}/${hex}` : null;
      return { ...skill, slug, hex, svg };
    })
  }));
  return NextResponse.json(enriched);
}
