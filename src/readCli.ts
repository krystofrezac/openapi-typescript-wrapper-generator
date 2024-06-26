import minimist from 'minimist';
import { z } from 'zod';
import { relativePathToAbsolute } from './helpers/relativePathToAbsolute';
import { Config } from './types';

const argvSchema = z.object({
  _: z.tuple([z.string()]),
  wrapperPath: z.string(),
  wrapperTypePath: z.string(),
  configurationPath: z.string(),
  outputPath: z.string(),

  wrapperExportName: z.string().optional(),
  wrapperTypeExportName: z.string().optional(),
  configurationExportName: z.string().optional(),
});

export const readCli = (): Config => {
  const argvRaw = minimist(process.argv.slice(2));
  const argv = argvSchema.parse(argvRaw);

  const sourceDirectoryRelativePath = argv._[0];
  const sourceDirectoryAbsolutePath = relativePathToAbsolute(
    sourceDirectoryRelativePath,
  );

  const wrapperRelativePath = argv.wrapperPath;
  const wrapperAbsolutePath = relativePathToAbsolute(wrapperRelativePath);

  const wrapperTypeRelativePath = argv.wrapperTypePath;
  const wrapperTypeAbsolutePath = relativePathToAbsolute(
    wrapperTypeRelativePath,
  );

  const configurationRelativePath = argv.configurationPath;
  const configurationAbsolutePath = relativePathToAbsolute(
    configurationRelativePath,
  );

  const outputRelativePath = argv.outputPath;
  const outputAbsolutePath = relativePathToAbsolute(outputRelativePath);

  const wrapperExportName = argv.wrapperExportName;
  const wrapperTypeExportName = argv.wrapperTypeExportName;
  const configurationExportName = argv.configurationExportName;

  return {
    sourceDirectoryAbsolutePath,
    wrapperAbsolutePath,
    wrapperTypeAbsolutePath,
    configurationAbsolutePath,
    outputAbsolutePath,

    wrapperExportName,
    wrapperTypeExportName,
    configurationExportName,
  };
};
