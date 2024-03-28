import { Project } from 'ts-morph';
import { getEndpointGroups } from './getEndpointGroups';
import { Config } from './types';
import { generateOutputFileContent } from './generateOutputFileContent';

export const generateWrappers = async (config: Config) => {
  const project = new Project();
  const endpointGroups = getEndpointGroups(project, config);
  const output = generateOutputFileContent(endpointGroups, config);

  const generatedSourceFile = project.createSourceFile(
    config.outputAbsolutePath,
    undefined,
    { overwrite: true },
  );
  generatedSourceFile.insertText(0, output);
  await generatedSourceFile.save();
};
