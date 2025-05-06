export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  homepage: string | null;
  created_at: string;
  default_branch: string;
}
export interface Project {
  title: string;
  repo: GitHubRepo;
  thumbnails: string[];
  priority?: number;
  isUniversityProject?: boolean;
  workingOn?: boolean;
  default_image_url: string;
}