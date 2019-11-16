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


    // TODO used start index, go over edge and go this.length - 1 steps (numbers)

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


const places = 5;
const letters = 10;


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

function getUniqueIndexCombinationsNonRec(places: number, letters: number): IteratorAndIterable<number[]> {
  let i = 0;

  return makeIterAndIter(() => {
    const currentConfig = [];
    for (let p = 0; p < places; p++) {
      const group = Math.floor(i / getGroupLength(p, letters, places));
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

const getUniqueIndexCombinationsRec = (places: number, letters: number, amount: number = faculty(letters)) => {
  const correct = new Array(amount);

  for (let i = 0; i < amount; i++) {
    const currentConfig = [];
    for (let p = 0; p < places; p++) {
      const group = Math.floor(i / getGroupLength(p, letters, places));
      const inGroupCount = group % (letters - p);

      let actualIndex = inGroupCount;
      for (let u = 0; u < p; u++) {
        if (actualIndex >= currentConfig[u])
          actualIndex++;
      }

      currentConfig[p] = actualIndex;
    }
    correct[i] = currentConfig;
  }

  return correct;
}

console.log(turnToString(
  getFirstXElementsFromIte(getUniqueIndexCombinationsNonRec(places, letters), 10),
  getGroupLength(0, letters, places))
);

