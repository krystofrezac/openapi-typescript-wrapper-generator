import { readCli } from './readCli';
import { generateWrappers } from './generateWrappers';

const config = readCli();

generateWrappers(config);
