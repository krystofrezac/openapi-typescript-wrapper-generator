import path from 'path';

export const relativePathToAbsolute = (relativePath: string) => {
  return path.join(process.cwd(), relativePath);
};
