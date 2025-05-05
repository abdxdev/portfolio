import { NextResponse } from 'next/server';

interface Project {
  raw_name: string;
  name: string;
  description: string;
  language: string | null;
  html_url: string;
  homepage: string | null;
  created_at: string;
  thumbnails: string[];
  priority?: number;
  isUniversityProject?: boolean;
  workingOn?: boolean;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  homepage: string | null;
  created_at: string;
}

const snakeToTitle = (str: string) => {
  str = str.replaceAll("-", " ").replaceAll("_", " ");
  return str
    .split(" ")
    .map((word) => word.replace(word[0], word[0].toUpperCase()))
    .join(" ");
};

const camelToTitle = (str: string) => {
  if (str.includes("LaTeX")) {
    return str;
  }
  return str.replace(/([a-z])([A-Z])/g, "$1 $2");
};

async function getGithubProjects(username: string): Promise<Project[]> {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data: GitHubRepo[] = await response.json();

  const filteredProjects = data
    .filter((repo: GitHubRepo) => {
      if (!repo.description) return false;
      const parsedDesc = parse(repo.description);
      return parsedDesc.is_parsable;
    })
    .map((repo: GitHubRepo) => {
      const parsedDesc = parse(repo.description || '');

      const screenshotCount = typeof parsedDesc.s === 'number' ? parsedDesc.s : 0;
      const priority = typeof parsedDesc.p === 'number' ? parsedDesc.p : undefined;
      const isUniversityProject = parsedDesc.m === true;
      const workingOn = parsedDesc.w === true;

      return {
        raw_name: repo.name,
        name: camelToTitle(snakeToTitle(repo.name)),
        description: parsedDesc.description,
        language: repo.language,
        html_url: repo.html_url,
        homepage: repo.homepage,
        created_at: repo.created_at,
        priority,
        isUniversityProject,
        workingOn,
        thumbnails: screenshotCount > 0
          ? Array.from({ length: screenshotCount }, (_, i) =>
            `https://raw.githubusercontent.com/${username}/${repo.name}/main/screenshots/screenshot_${i + 1}.png`
          )
          : []
      };
    });

  return filteredProjects;
}

function parse(string: string): {
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'github';
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    let projects: Project[] = [];

    switch (source) {
      case 'github':
        projects = await getGithubProjects(username);
        break;
      // Add more sources here as needed
      default:
        return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
    }

    // Sort projects by priority and creation date
    projects.sort((a, b) => {
      if (a.priority !== undefined && b.priority !== undefined) {
        if (a.priority === b.priority) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return a.priority - b.priority;
      }
      if (a.priority !== undefined) return -1;
      if (b.priority !== undefined) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Error fetching projects' }, { status: 500 });
  }
}