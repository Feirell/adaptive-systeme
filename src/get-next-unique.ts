const checkForRangeError = false;
class UsedMemory {
  private readonly used = new Array(this.length).fill(false);
  constructor(readonly length: number) { }

  private checkRange(index: number) {
    if (!Number.isInteger(index))
      throw new Error('index needs to be an integer but was ' + index);

    if (index >= this.length || index < 0)
      throw new RangeError("index needs to be between the length (exclusive) and 0 (inclusive) but was " + index);
  }

  reset() {
    this.used.fill(false);
  }

  use(index: number) {
    if (checkForRangeError)
      this.checkRange(index);

    this.used[index] = true;
  }

  unuse(index: number) {
    if (checkForRangeError)
      this.checkRange(index);

    this.used[index] = false;
  }

  getNextUnused(startIndex: number) {
    if (checkForRangeError)
      this.checkRange(startIndex);

    for (let i = 0; i < this.length; i++) {
      let acutalIndex = startIndex + i
      if (acutalIndex >= this.length)
        acutalIndex = acutalIndex % this.length;

      if (!this.used[acutalIndex])
        return acutalIndex;
    }

    return null;
  }

  getNextUnusedAndMarkAsUsed(startIndex: number) {
    const next = this.getNextUnused(startIndex);

    if (next != null)
      this.use(next);

    return next;
  }

  getUnusedWithIndex(startIndex: number) {
    for (let i = 0; i < this.length; i++) {
      if (!this.used[i])
        if (startIndex == 0)
          return i;
        else
          startIndex--;
    }

    return null;
  }

  getUnusedWithIndexAndMarkAsUsed(startIndex: number) {
    const next = this.getUnusedWithIndex(startIndex);

    if (next != null)
      this.use(next);

    return next;
  }

  getUnusedWithIndexAndSwitchToNew(startIndex: number) {
    const next = this.getUnusedWithIndex(startIndex);

    if (next != null && startIndex != next) {
      this.unuse(startIndex);
      this.use(next);
    }

    return next;
  }

  getIndexOfItemInUnused(index: number) {
    let acc = 0;

    for (let i = 0; i < this.length; i++) {
      const used = this.used[i];

      if (i == index) {
        if (used)
          throw new Error('the given index ' + index + ' was not unused');

        return acc;
      }

      if (!used)
        acc++;
    }
  }
}

interface IteratorAndIterable<T> extends Iterator<T, T>, Iterable<T> { }

// export function getCombinationOnlyUniqueNext<T>(elements: T[], lengthOfCombination: number = elements.length): Iterator<T[], T[]> & Iterable<T[]> {
//   const elems = elements.length;
//   let currentComb = new Uint8Array(lengthOfCombination);

//   for (let i = 0; i < currentComb.length; i++)
//     currentComb[i] = i;

//   if (elements.length > lengthOfCombination)
//     throw new Error('lengthOfCombination needs to be less than the length of elements ' + lengthOfCombination + ' length of element was ' + elements.length);

//   const iterable = {
//     next: () => {
//       const ret: T[] = new Array(lengthOfCombination);
//       for (let i = 0; i < lengthOfCombination; i++) {
//         const elementIndex = currentComb[i];
//         ret[i] = elements[elementIndex];
//       }
//       // console.log('ret', currentComb, ret);

//       let done = false;
//       const used = new UsedMemory(elems);
//       const newComb = new Uint8Array(lengthOfCombination);
//       for (let i = lengthOfCombination - 1; i >= 0; i--) {
//         const currentUsedIndex = currentComb[i];
//         // console.log('currentUsedIndex', i, currentUsedIndex);
//         const val = used.getNextUnusedAndMarkAsUsed((currentUsedIndex + 1) % elems);
//         if (val == null)
//           throw new Error('there are no elements left');

//         newComb[i] = val;
//       }

//       currentComb = newComb;
//       return { value: ret, done: done };
//     },
//     [Symbol.iterator]: () => iterable
//   }

//   return iterable;
// }

// export function getCombinationOnlyUniqueNext<T>(elements: T[], lengthOfCombination: number = elements.length): Iterator<T[], T[]> & Iterable<T[]> {
//   const iteLength = new Uint8Array(lengthOfCombination);
//   for (let i = 0; i < lengthOfCombination; i++)
//     iteLength[i] = Math.

//   const elems = elements.length;
//   let currentComb = new Uint8Array(lengthOfCombination);

//   for (let i = 0; i < currentComb.length; i++)
//     currentComb[i] = i;

//   if (elements.length > lengthOfCombination)
//     throw new Error('lengthOfCombination needs to be less than the length of elements ' + lengthOfCombination + ' length of element was ' + elements.length);

//   const iterable = {
//     next: () => {
//       const ret: T[] = new Array(lengthOfCombination);
//       for (let i = 0; i < lengthOfCombination; i++) {
//         const elementIndex = currentComb[i];
//         ret[i] = elements[elementIndex];
//       }
//       // console.log('ret', currentComb, ret);

//       let done = false;
//       const used = new UsedMemory(elems);
//       const newComb = new Uint8Array(lengthOfCombination);
//       for (let i = lengthOfCombination - 1; i >= 0; i--) {
//         const currentUsedIndex = currentComb[i];
//         // console.log('currentUsedIndex', i, currentUsedIndex);
//         const val = used.getNextUnusedAndMarkAsUsed((currentUsedIndex + 1) % elems);
//         if (val == null)
//           throw new Error('there are no elements left');

//         newComb[i] = val;
//       }

//       currentComb = newComb;
//       return { value: ret, done: done };
//     },
//     [Symbol.iterator]: () => iterable
//   }

//   return iterable;
// }

// const elems = new Array(3).fill(0).map((_, i) => (10 + i).toString(36));
// const ite = getCombinationOnlyUniqueNext(elems);
// for (let i = 0; i < 10; i++) {
//   console.log(i, ite.next().value);
// }
// const allElems = Array.from(ite);
// console.log(allElems);

export function* getCombinationOnlyUnique<T>(elements: T[], lengthOfCombination: number = elements.length): Generator<T[]> {
  for (let i = 0; i < elements.length; i++) {
    const copy = elements.slice(0);
    const current = copy.splice(i, 1)[0];

    if (lengthOfCombination > 1)
      for (const combination of getCombinationOnlyUnique(copy, lengthOfCombination - 1)) {
        yield [current, ...combination];
      }
    else
      yield [current];
  }
}

function* getCombinationOnlyUniqueNew<T>(elements: T[], lengthOfCombination: number = elements.length): Generator<T[]> {
  for (let i = 0; i < elements.length; i++) {
    const copy = elements.slice(0);
    const current = copy.splice(i, 1)[0];

    if (lengthOfCombination > 1)
      for (const combination of getCombinationOnlyUnique(copy, lengthOfCombination - 1)) {
        yield [current, ...combination];
      }
    else
      yield [current];
  }
}

const turnToString = (arr: number[][], group: number) => {
  let acc = [];
  // const mult = faculty(letters - 1);
  const mult = group;
  for (let corr = 0; corr < Math.ceil(arr.length / group); corr++) {

    acc.push(arr.slice(corr * mult, (corr + 1) * mult).map(v => v.join(' ')).join('\n'))
  }

  return acc.join('\n\n');
}


const faculty = (n: number, bottom = 1) => {
  let acc = 1;

  while (n > bottom)
    acc *= n--;

  return acc;
}

const getGroupLength = (group: number, letters: number, width: number) =>
  faculty(letters - 1 - group, letters - width)


// amount: number = faculty(letters)

const makeIterAndIter = <T>(step: () => T): IteratorAndIterable<T> => {
  const iter: IteratorAndIterable<T> = {
    next: () => ({ value: step(), done: false }),
    [Symbol.iterator]: () => iter
  }
  return iter;
}

const getFirstXElementsFromIte = <T>(ite: Iterable<T>, elemCount: number): T[] => {
  const iterable = ite[Symbol.iterator]();

  if (elemCount <= 0)
    return [];

  let ret = [];
  let elem;
  do {
    elem = iterable.next();
    ret.push(elem.value);
  } while (!elem.done && --elemCount > 0)

  return ret;
}

const generatorToIte = <T>(gen: Generator<T>): IteratorAndIterable<T> => {
  const ite = {
    next: () => gen.next(),
    [Symbol.iterator]: () => ite
  }

  return ite;
}

const getUniqueIndexCombinationsOld = (places: number, letters: number): IteratorAndIterable<number[]> =>
  generatorToIte(getCombinationOnlyUnique(new Array(letters).fill(0).map((_, i) => i), places));

function getUniqueIndexCombinationsNonRec(places: number, letters: number): IteratorAndIterable<number[]> {
  let i = 0;

  const groupLength = new Uint32Array(places).map((_, i) => getGroupLength(i, letters, places));

  return makeIterAndIter(() => {
    const currentConfig = [];
    for (let p = 0; p < places; p++) {
      const group = Math.floor(i / groupLength[p]);
      const inGroupCount = group % (letters - p);

      let actualIndex = inGroupCount;
      for (let u = 0; u < p; u++) {
        if (actualIndex >= currentConfig[u])
          actualIndex++;
      }

      currentConfig[p] = actualIndex;

    }

    i++;
    return currentConfig;
  })
}

const logging = false;

const getUniqueIndexCombinationsNonRecBetter = (places: number, letters: number): IteratorAndIterable<number[]> => {
  return generatorToIte((function* () {
    let current: (null | number)[] = [null, null, null];

    const mem = new UsedMemory(letters);

    let column = 0;
    while (column >= 0) {
      if (logging)
        console.groupEnd();
      if (logging)
        console.group('column', column);

      if (current[column] != null)
        mem.unuse(current[column] as number);

      const currentUsedVariation = current[column] !== null ? mem.getIndexOfItemInUnused(current[column] as number) as number : -1;
      const availableVariations = letters - column;

      if (currentUsedVariation == availableVariations - 1) {
        current[column] = null as any;
        column--;
      } else {
        for (let variation = currentUsedVariation + 1; variation < availableVariations; variation++) {

          current = current.slice(0);

          const val = mem.getUnusedWithIndex(variation) as number;

          const before = current.slice(0);
          current[column] = val as any as number;

          const isLastColumn = column == places - 1;
          const doneAllVariations = variation == letters - column - 1;

          if (logging)
            console.log('combination before', before, 'isLastColumn', isLastColumn, 'doneAllVariations', doneAllVariations, 'column', column, ', variation', variation, 'availableVariations', availableVariations, ', received value:', val, 'combination after', current.slice(0));


          if (!isLastColumn) {
            // go to next column
            mem.use(current[column] as number);
            column++;
            break;
          }

          // yield result
          const result = current.slice(0) as number[];
          yield result;

          if (doneAllVariations) {
            // go to previous column
            mem.unuse(current[column] as number);
            current[column] = null;
            column--;
            break;
          }

        }
      }
    }

    if (logging)
      console.log('finished the loop', column);
  })())

  // const currentConfig = [];
  // for (let p = 0; p < places; p++) {
  //   const group = Math.floor(i / getGroupLength(p, letters, places));
  //   const inGroupCount = group % (letters - p);

  //   let actualIndex = inGroupCount;
  //   for (let u = 0; u < p; u++) {
  //     if (actualIndex >= currentConfig[u])
  //       actualIndex++;
  //   }

  //   currentConfig[p] = actualIndex;
  // }

  // return currentConfig;
}


const places = 3;
const letters = 12;

interface Algorithm {
  (places: number, letters: number): IteratorAndIterable<number[]>
}

const speedTest = (letters: number, places: number) => {
  const definedAlgorithms: Algorithm[] = [
    getUniqueIndexCombinationsOld,
    getUniqueIndexCombinationsNonRecBetter,
    getUniqueIndexCombinationsNonRec
  ];

  for (const algorithm of definedAlgorithms) {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      getFirstXElementsFromIte(algorithm(places, letters), faculty(letters, letters - places));
    }
    const diff = performance.now() - start;

    console.log('diff for %s was %d', algorithm.name, diff);
  }
}


const printAlgorithmOutput = (letters: number, places: number, algorithm: Algorithm) => {

  const res = [];

  let i = 0, elem;

  let maxReturn = faculty(letters)
  const ite = algorithm(places, letters);

  while (elem = ite.next(), !elem.done) {
    if (--maxReturn < 0)
      throw new Error('algorithm ' + algorithm.name + ' should have stopped since it returned all variations');

    res.push(elem.value);

    // if (logging)
    //   console.log(i++, elem.value);
  }

  const stringified = turnToString(res, faculty(letters - 1, letters - places));

  console.log(stringified);
}

printAlgorithmOutput(4, 3, getUniqueIndexCombinationsNonRecBetter);
printAlgorithmOutput(4, 3, getUniqueIndexCombinationsOld);