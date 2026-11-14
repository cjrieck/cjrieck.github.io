import data from './projects.json';

export type Layer = { kind: string; title: string; note?: string };
export type Project = {
  id: string;
  title: string;
  summary: string;
  image?: string;
  imageAlt?: string;
  layers?: Layer[];
};
export type TeardownData = {
  labels?: { whole?: string; parts?: string; part?: string };
  projects: Project[];
};

export const projectData = data as TeardownData;
export const PROJECT_IMAGE_BASE = `${process.env.PUBLIC_URL}/projects/`;
