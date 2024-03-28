import path from 'path';

import { Project } from 'ts-morph';
import { API_FILE_NAME_WITH_EXTENSION } from './constants';
import { Config } from './types';

type EndpointGroupMethod = {
  name: string;
  isDeprecated: boolean;
};

export type EndpointGroup = {
  className: string;
  methods: EndpointGroupMethod[];
};

const DEPRECATED_TAG_NAME = 'deprecated';

export const getEndpointGroups = (project: Project, config: Config) => {
  const apiFilePath = path.join(
    config.sourceDirectoryAbsolutePath,
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
