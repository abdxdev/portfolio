import { NextRequest, NextResponse } from 'next/server';
import { Project, GitHubRepo } from "@/types/project";
import { parse, camelToTitle, snakeToTitle } from "@/lib/utils";

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
        title: camelToTitle(snakeToTitle(repo.name)),
        repo: repo,
        priority,
        isUniversityProject,
        workingOn,
        thumbnails: screenshotCount > 0
          ? Array.from({ length: screenshotCount }, (_, i) =>
            `https://raw.githubusercontent.com/${username}/${repo.name}/${repo.default_branch}/screenshots/screenshot_${i + 1}.png`
          )
          : [],
        default_image_url: `https://opengraph.githubassets.com/1/${username}/${repo.name}`
      };
    });

  return filteredProjects;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const username = searchParams.get('username') || process.env.GITHUB_USERNAME;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    let projects: Project[] = [];
    projects = await getGithubProjects(username);

    projects.sort((a, b) => {
      if (a.priority !== undefined && b.priority !== undefined) {
        if (a.priority === b.priority) {
          return new Date(b.repo.created_at).getTime() - new Date(a.repo.created_at).getTime();
        }
        return a.priority - b.priority;
      }
      if (a.priority !== undefined) return -1;
      if (b.priority !== undefined) return 1;
      return new Date(b.repo.created_at).getTime() - new Date(a.repo.created_at).getTime();
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Error fetching projects' }, { status: 500 });
  }
}