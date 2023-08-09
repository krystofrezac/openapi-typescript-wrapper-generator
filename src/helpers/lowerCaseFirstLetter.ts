export const lowerCaseFirstLetter = (value: string) =>
  [...value]
    .map((char, index) => (index === 0 ? char.toLowerCase() : char))
    .join('');
