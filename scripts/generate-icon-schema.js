import fs from 'fs';
import path from 'path';

const iconsUrl = 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/_data/simple-icons.json';
const outputPath = path.join('src', 'data', 'skills-schema.json');

(async () => {
  const res = await fetch(iconsUrl);
  if (!res.ok) throw new Error(`Failed to fetch icons: ${res.status}`);
  const data = await res.json();
  const iconsArray = Array.isArray(data) ? data : data.icons;
  if (!iconsArray) throw new Error('No icons found in response');

  const pairedIcons = iconsArray.map(icon => ({ name: icon.title, hex: icon.hex }));
  const oneOfEntries = pairedIcons.map(({ name, hex }) => ({
    type: 'object',
    properties: {
      name: { const: name },
      hex: { const: hex },
      portfolio: { type: 'boolean' }
    },
    required: ['name', 'portfolio'],
    additionalProperties: false
  }));

  const defaultSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Skills',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        category: { type: 'string' },
        description: { type: 'string' },
        skills: {
          type: 'array',
          items: {
            oneOf: oneOfEntries
          }
        }
      },
      required: ['category', 'description', 'skills'],
      additionalProperties: false
    }
  };

  fs.writeFileSync(outputPath, JSON.stringify(defaultSchema, null, 2));
  console.log('Generated schema at', outputPath);
})();