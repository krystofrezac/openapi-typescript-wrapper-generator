import path from 'path';

import { Project } from 'ts-morph';
import { CliOptions } from './readCli';
import { API_FILE_NAME_WITH_EXTENSION } from './constants';

export type EndpointGroup = {
  className: string;
  methodNames: string[];
};

export const getEndpointGroups = (project: Project, cliOptions: CliOptions) => {
  const apiFilePath = path.join(
    cliOptions.sourceDirectoryAbsolutePath,
    API_FILE_NAME_WITH_EXTENSION,
  );

  const apiSourceFile = project.addSourceFileAtPath(apiFilePath);

  const endpointGroups: EndpointGroup[] = apiSourceFile
    ?.getClasses()
    .flatMap(cls => {
      const className = cls.getNameOrThrow();

      const methodNames: string[] = cls
        .getMethods()
        .map(method => method.getName());
      return { className, methodNames };
    });
  return endpointGroups;
};
