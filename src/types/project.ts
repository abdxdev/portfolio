export interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  html_url: string;
  homepage: string | null;
  created_at: string;
  default_branch: string;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
}
export interface Project {
  title: string;
  raw_name: string;
  description: string;
  raw_description: string;
  homepage: string | null;
  html_url: string;
  fork: boolean;
  created_at: string;
  language: string;
  stargazers_count: number;
  watchers_count: number;
  default_branch: string;
  priority?: number;
  is_university_project?: boolean;
  working_on?: boolean;
  default_image_url: string;
  thumbnails: string[];
}