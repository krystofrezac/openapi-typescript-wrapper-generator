import path from 'path';

import { Project } from 'ts-morph';
import { CliOptions } from './readCli';
import { API_FILE_NAME_WITH_EXTENSION } from './constants';

type EndpointGroupMethod = {
  name: string;
  isDeprecated: boolean;
};

export type EndpointGroup = {
  className: string;
  methods: EndpointGroupMethod[];
};

const DEPRECATED_TAG_NAME = 'deprecated';

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

      const methods: EndpointGroupMethod[] = cls.getMethods().map(method => {
        const isDeprecated = method
          .getJsDocs()
          .some(jsDoc =>
            jsDoc
              .getTags()
              .some(tag => tag.getTagName() === DEPRECATED_TAG_NAME),
          );

        return {
          name: method.getName(),
          isDeprecated,
        };
      });
      return { className, methods };
    });
  return endpointGroups;
};
