import { Project } from 'ts-morph';
import { getEndpointGroups } from './getEndpointGroups';
import { readCli } from './readCli';
import { generateOutputFileContent } from './generateOutputFileContent';

const cliOptions = readCli();

const project = new Project();
const endpointGroups = getEndpointGroups(project, cliOptions);
const output = generateOutputFileContent(endpointGroups, cliOptions);

const generatedSourceFile = project.createSourceFile(
  cliOptions.outputAbsolutePath,
  undefined,
  { overwrite: true },
);
generatedSourceFile.insertText(0, output);
generatedSourceFile.save();
