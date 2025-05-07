import { NextRequest, NextResponse } from 'next/server';
import { Project, GitHubRepo } from "@/types/project";
import { parse, camelToTitle, snakeToTitle } from "@/lib/utils";
import socials from '@/data/socials.json';
import { filterItemsByQuery } from '@/lib/utils';

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
      const is_university_project = parsedDesc.m === true;
      const working_on = parsedDesc.w === true;

      return {
        title: camelToTitle(snakeToTitle(repo.name)),
        raw_name: repo.name,
        description: parsedDesc.description,
        raw_description: repo.description,
        homepage: repo.homepage,
        html_url: repo.html_url,
        fork: repo.fork,
        created_at: repo.created_at,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        watchers_count: repo.watchers_count,
        default_branch: repo.default_branch,
        priority,
        is_university_project,
        working_on,
        default_image_url: `https://opengraph.githubassets.com/1/${username}/${repo.name}`,
        thumbnails: screenshotCount > 0 ? Array.from({ length: screenshotCount }, (_, i) =>
          `https://raw.githubusercontent.com/${username}/${repo.name}/${repo.default_branch}/screenshots/screenshot_${i + 1}.png`
        ) : [],
      };
    });

  return filteredProjects;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    let username = searchParams.get('username');
    if (!username) {
      const matched = filterItemsByQuery(socials, new URLSearchParams([['github', 'true']]), 'name');
      if (matched.length === 0) {
        return NextResponse.json({ error: 'GitHub social not found' }, { status: 404 });
      }
      username = matched[0].username;
    }
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    let projects: Project[] = [];
    projects = await getGithubProjects(username);

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