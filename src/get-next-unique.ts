class UsedMemory {
  private readonly used = new Array(this.length).fill(false);
  constructor(readonly length: number) { }

  private checkRange(index: number) {
    if (!Number.isInteger(index))
      throw new Error('index needs to be an integer');

    if (index >= this.length || index < 0)
      throw new RangeError("index needs to be between the length (exclusive) and 0 (inclusive) but was " + index);
  }

  reset() {
    this.used.fill(false);
  }

  use(index: number) {
    this.checkRange(index);
    this.used[index] = true;
  }

  unuse(index: number) {
    this.checkRange(index);
    this.used[index] = false;
  }

  getNextUnused(startIndex: number) {
    this.checkRange(startIndex);

    // TODO used start index, go over edge and go this.length - 1 steps (numbers)

    for (let i = 0; i < this.length; i++)
      if (!this.used[i])
        return i;

    return null;
  }

  getNextUnusedAndMarkAsUsed(startIndex: number) {
    const next = this.getNextUnused(startIndex);
    if (next != null)
      this.use(next);

    return next;
  }
}

export function getCombinationOnlyUniqueNext<T>(elements: T[], lengthOfCombination: number = elements.length): Iterator<T[]> {
  const elems = elements.length;
  let currentComb = new Uint8Array(lengthOfCombination);

  if (elements.length > lengthOfCombination)
    throw new Error('lengthOfCombination needs to be less than the length of elements ' + lengthOfCombination + ' length of element was ' + elements.length);

  return {
    next: () => {
      const ret = new Array(lengthOfCombination);
      for (let i = 0; i < lengthOfCombination; i++)
        ret[i] = currentComb[ret[i]];

      let done = false;
      const used = new UsedMemory(elems);
      const newComb = new Uint8Array(lengthOfCombination);
      for (let i = lengthOfCombination - 1; i >= 0; i++) {
        const val = used.getNextUnusedAndMarkAsUsed(currentComb[i])
        if (val == null)
          throw new Error('there are no elements left');

        newComb[i] = val;
      }

      return { value: false as any, done: false };
    }
  }
}

const elems = new Array(3).map((_, i) => (10 + i).toString(36));

console.log(Array.from(getCombinationOnlyUniqueNext(elems)))