export const removeExtensionFromPath = (path: string) =>
  path.substring(0, path.lastIndexOf('.'));
