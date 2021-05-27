export interface WidgetFolderStructureInterface {
  base: string;
  build: string;
  src: string;
  packageJSON: string;
  packageXML: string;
}

export const PROJECT_PATH = `${process.env.GITHUB_WORKSPACE}`;
export const baseDir = process.env.GITHUB_WORKSPACE;
