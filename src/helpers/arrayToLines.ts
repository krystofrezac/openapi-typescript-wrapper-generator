export const arrayToLines = (value: string[], numberOfNewLines = 1) =>
  value.join('\n'.repeat(numberOfNewLines));
