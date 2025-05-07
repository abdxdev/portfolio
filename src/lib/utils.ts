import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a string containing a description and optional marker codes.
 * 
 * This function parses strings in the format "description: marker1 marker2..." where:
 * - Everything before the colon is considered the description
 * - After the colon, there can be various markers like:
 *   - Bare numbers (e.g., ":23") set a "number" key
 *   - Letter markers (e.g., ":p") set that key to true
 *   - Letter markers with numbers (e.g., ":p3") set that key to the number
 * - Multiple markers can be separated by colons (e.g., ":p3:s5")
 * 
 * If the string doesn't follow this format (lacks a colon or has spaces in marker part),
 * it is considered not parsable.
 * 
 * @param string The input string to parse
 * @returns An object containing parsing results
 */
export function parse(string: string): {
  is_parsable: boolean;
  description: string;
  [key: string]: boolean | string | number;
} {
  const result: {
    is_parsable: boolean;
    description: string;
    [key: string]: boolean | string | number;
  } = {
    is_parsable: false,
    description: string,
  };

  if (!string.includes(":")) {
    return result;
  }

  if (string.trim().endsWith(":")) {
    result.is_parsable = true;
    result.description = string.trim().replace(/:$/, "").trim();
    return result;
  }

  const parts = string.split(":");
  if (parts.length < 2) {
    return result;
  }

  const description = parts[0];
  const markerParts = parts.slice(1);

  for (const part of markerParts) {
    if (part.trim() && part.includes(" ")) {
      return result;
    }
  }

  result.is_parsable = true;
  result.description = description.trim();

  for (const part of markerParts) {
    const trimmedPart = part.trim();
    if (!trimmedPart) {
      continue;
    }

    if (/^\d+$/.test(trimmedPart)) {
      result.number = parseInt(trimmedPart, 10);
      continue;
    }

    const match = trimmedPart.match(/^([a-zA-Z]+)(\d+)?$/);
    if (match) {
      const [, marker, value] = match;
      if (value) {
        result[marker] = parseInt(value, 10);
      } else {
        result[marker] = true;
      }
    }
  }

  return result;
}

export const snakeToTitle = (str: string) => {
  str = str.replaceAll("-", " ").replaceAll("_", " ");
  return str
    .split(" ")
    .map((word) => word.replace(word[0], word[0].toUpperCase()))
    .join(" ");
};

export const camelToTitle = (str: string) => {
  if (str.includes("LaTeX")) {
    return str;
  }
  return str.replace(/([a-z])([A-Z])/g, "$1 $2");
};