function* getCombinationOnlyUnique<T>(lengthOfCombination: number, elements: T[]): Generator<T[]> {
  for (let i = 0; i < elements.length; i++) {
    const copy = elements.slice(0);
    const current = copy.splice(i, 1)[0];

    if (lengthOfCombination > 1)
      for (const combination of getCombinationOnlyUnique(lengthOfCombination - 1, copy)) {
        yield [current, ...combination];
      }
    else
      yield [current];
  }
}