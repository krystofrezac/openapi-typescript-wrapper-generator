import path from 'path';

import { EndpointGroup } from './getEndpointGroups';
import { arrayToLines } from './helpers/arrayToLines';
import { CliOptions } from './readCli';
import {
  CONFIGURATION_FUNCTION_NAME,
  WRAPPER_FUNCTION_NAME,
  WRAPPER_TYPE_NAME,
} from './constants';
import { lowerCaseFirstLetter } from './helpers/lowerCaseFirstLetter';
import { removeExtensionFromPath } from './helpers/removeExtensionFromPath';

const BEFORE_API_SUFFIX_REGEX = /.*(?=Api)/;

const getImports = (
  endpointGroups: EndpointGroup[],
  cliOptions: CliOptions,
) => {
  const classNames = endpointGroups.map(group => group.className);
  const joinedClassNames = classNames.join(', ');

  const relativePathToWrapperWithExtension = path.relative(
    cliOptions.sourceDirectoryAbsolutePath,
    cliOptions.wrapperAbsolutePath,
  );
  const relativePathToWrapper = removeExtensionFromPath(
    relativePathToWrapperWithExtension,
  );
  const wrapperImportName = cliOptions.wrapperExportName
    ? `{${cliOptions.wrapperExportName} as ${WRAPPER_FUNCTION_NAME}}`
    : WRAPPER_FUNCTION_NAME;

  const relativePathToTypeWrapperWithExtension = path.relative(
    cliOptions.sourceDirectoryAbsolutePath,
    cliOptions.wrapperTypeAbsolutePath,
  );
  const relativePathToTypeWrapper = removeExtensionFromPath(
    relativePathToTypeWrapperWithExtension,
  );
  const wrapperTypeImportName = cliOptions.wrapperTypeExportName
    ? `{${cliOptions.wrapperTypeExportName} as ${WRAPPER_TYPE_NAME}}`
    : WRAPPER_TYPE_NAME;

  const relativePathToConfigurationWithExtension = path.relative(
    cliOptions.sourceDirectoryAbsolutePath,
    cliOptions.configurationAbsolutePath,
  );
  const relativePathToConfiguration = removeExtensionFromPath(
    relativePathToConfigurationWithExtension,
  );

  const configurationImportName = cliOptions.configurationExportName
    ? `{${cliOptions.configurationExportName} as ${CONFIGURATION_FUNCTION_NAME}}`
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

const getFilePathVariable = (cliOptions: CliOptions) =>
  `const filePath = '${cliOptions.outputRelativePath}'`;

const getWrappedEndpoints = (endpointGroups: EndpointGroup[]) => {
  const wrappedGroups = endpointGroups.map(group => {
    const className =
      group.className.match(BEFORE_API_SUFFIX_REGEX)?.[0] ?? 'unknown';
    const lowerCasedClassName = lowerCaseFirstLetter(className);
    const groupName = `${lowerCasedClassName}Endpoints`;

    const classVariableName = getClassInstanceVariableName(group.className);

    const endpointProperties = group.methodNames
      .map(methodName => {
        const wrapperOptions = `{filePath, groupName: '${className}', endpointName: '${methodName}'}`;

        return `  ${methodName}: ${WRAPPER_FUNCTION_NAME}(${classVariableName}.${methodName}, ${wrapperOptions})`;
      })
      .join(',\n');

    const endpointTypeProperties = group.methodNames
      .map(methodName => {
        const wrapperOptions = `{filePath: typeof filePath, groupName: '${className}', endpointName: '${methodName}'}`;

        return `  ${methodName}: ${WRAPPER_TYPE_NAME}<typeof ${classVariableName}.${methodName}, ${wrapperOptions}>`;
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
  cliOptions: CliOptions,
) => {
  const imports = getImports(endpointGroups, cliOptions);
  const classInitializations = getClassInitializations(endpointGroups);
  const filePathVariable = getFilePathVariable(cliOptions);
  const wrappedEndpoints = getWrappedEndpoints(endpointGroups);

  return arrayToLines(
    [imports, classInitializations, filePathVariable, wrappedEndpoints],
    2,
  );
};
