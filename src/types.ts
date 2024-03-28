export type WrapperOptions = {
  groupName: string;
  endpointName: string;
  filePath: string;
};

export type Config = {
  sourceDirectoryAbsolutePath: string;
  wrapperAbsolutePath: string;
  wrapperTypeAbsolutePath: string;
  configurationAbsolutePath: string;
  outputAbsolutePath: string;

  wrapperExportName?: string;
  wrapperTypeExportName?: string;
  configurationExportName?: string;
};
