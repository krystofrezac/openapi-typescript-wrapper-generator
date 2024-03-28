import path from 'path';

import { EndpointGroup } from './getEndpointGroups';
import { arrayToLines } from './helpers/arrayToLines';
import {
  CONFIGURATION_FUNCTION_NAME,
  WRAPPER_FUNCTION_NAME,
  WRAPPER_TYPE_NAME,
} from './constants';
import { lowerCaseFirstLetter } from './helpers/lowerCaseFirstLetter';
import { removeExtensionFromPath } from './helpers/removeExtensionFromPath';
import { Config } from './types';

const BEFORE_API_SUFFIX_REGEX = /.*(?=Api)/;

const maybeAddDeprecatedComment = (line: string, isDeprecated: boolean) => {
  if (!isDeprecated) return line;
  return ['  /** @deprecated */', line].join('\n');
};

const getImports = (endpointGroups: EndpointGroup[], config: Config) => {
  const classNames = endpointGroups.map(group => group.className);
  const joinedClassNames = classNames.join(', ');

  const relativePathToWrapperWithExtension = path.relative(
    config.sourceDirectoryAbsolutePath,
    config.wrapperAbsolutePath,
  );
  const relativePathToWrapper = removeExtensionFromPath(
    relativePathToWrapperWithExtension,
  );
  const wrapperImportName = config.wrapperExportName
    ? `{${config.wrapperExportName} as ${WRAPPER_FUNCTION_NAME}}`
    : WRAPPER_FUNCTION_NAME;

  const relativePathToTypeWrapperWithExtension = path.relative(
    config.sourceDirectoryAbsolutePath,
    config.wrapperTypeAbsolutePath,
  );
  const relativePathToTypeWrapper = removeExtensionFromPath(
    relativePathToTypeWrapperWithExtension,
  );
  const wrapperTypeImportName = config.wrapperTypeExportName
    ? `{${config.wrapperTypeExportName} as ${WRAPPER_TYPE_NAME}}`
    : WRAPPER_TYPE_NAME;

  const relativePathToConfigurationWithExtension = path.relative(
    config.sourceDirectoryAbsolutePath,
    config.configurationAbsolutePath,
  );
  const relativePathToConfiguration = removeExtensionFromPath(
    relativePathToConfigurationWithExtension,
  );

  const configurationImportName = config.configurationExportName
    ? `{${config.configurationExportName} as ${CONFIGURATION_FUNCTION_NAME}}`
    : CONFIGURATION_FUNCTION_NAME;

  return arrayToLines([
    `import {${joinedClassNames}} from './api'`,
    `import ${wrapperImportName} from '${relativePathToWrapper}'`,
    `import ${wrapperTypeImportName} from '${relativePathToTypeWrapper}'`,
    `import ${configurationImportName} from '${relativePathToConfiguration}'`,
  ]);
};

const getClassInstanceVariableName = (className: string) =>
  lowerCaseFirstLetter(className);

const getClassInitializations = (endpointGroups: EndpointGroup[]) => {
  const initializations = endpointGroups.map(({ className }) => {
    const variableName = getClassInstanceVariableName(className);
    return `const ${variableName} = new ${className}(${CONFIGURATION_FUNCTION_NAME})`;
  });

  return arrayToLines(initializations);
};

const getFilePathVariable = (config: Config) =>
  `const filePath = '${config.outputAbsolutePath}'`;

const getWrappedEndpoints = (endpointGroups: EndpointGroup[]) => {
  const wrappedGroups = endpointGroups.map(group => {
    const className =
      group.className.match(BEFORE_API_SUFFIX_REGEX)?.[0] ?? 'unknown';
    const lowerCasedClassName = lowerCaseFirstLetter(className);
    const groupName = `${lowerCasedClassName}Endpoints`;

    const classVariableName = getClassInstanceVariableName(group.className);

    const endpointProperties = group.methods
      .map(method => {
        const wrapperOptions = `{filePath, groupName: '${className}', endpointName: '${method.name}'}`;

        const codeWithDeprecatedComment = maybeAddDeprecatedComment(
          `  ${method.name}: ${WRAPPER_FUNCTION_NAME}(${classVariableName}.${method.name}.bind(${classVariableName}), ${wrapperOptions})`,
          method.isDeprecated,
        );
        return codeWithDeprecatedComment;
      })
      .join(',\n');

    const endpointTypeProperties = group.methods
      .map(method => {
        const wrapperOptions = `{filePath: typeof filePath, groupName: '${className}', endpointName: '${method.name}'}`;

        const codeWithDeprecatedComment = maybeAddDeprecatedComment(
          `  ${method.name}: ${WRAPPER_TYPE_NAME}<typeof ${classVariableName}.${method.name}, ${wrapperOptions}>`,
          method.isDeprecated,
        );
        return codeWithDeprecatedComment;
      })
      .join(';\n');

    return arrayToLines([
      `export const ${groupName} = {`,
      endpointProperties,
      '}',
      `export type ${groupName} = {`,
      endpointTypeProperties,
      '}',
    ]);
  });

  return arrayToLines(wrappedGroups, 2);
};

export const generateOutputFileContent = (
  endpointGroups: EndpointGroup[],
  config: Config,
) => {
  const imports = getImports(endpointGroups, config);
  const classInitializations = getClassInitializations(endpointGroups);
  const filePathVariable = getFilePathVariable(config);
  const wrappedEndpoints = getWrappedEndpoints(endpointGroups);

  return arrayToLines(
    [imports, classInitializations, filePathVariable, wrappedEndpoints],
    2,
  );
};
