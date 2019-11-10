import { PRNG } from './prng';
import { TSPNode } from './tsp-node';

const { abs, pow, sqrt } = Math;
export function getDistance(a: TSPNode, b: TSPNode): number {
  return sqrt(pow(abs(a.x - b.x), 2) + pow(abs(a.y - b.y), 2))
}

export function getPathLength(nodes: TSPNode[]): number {
  let length = 0;

  if (nodes.length > 1) {
    let last: TSPNode = nodes[0];
    for (let i = 1; i < nodes.length; i++) {
      const n = nodes[i];
      length += getDistance(last, n);
      last = n;
    }
    length += getDistance(nodes[0], last);
  }

  return length;
}

export function fisherYatesShuffle<T>(arr: T[], prng: PRNG) {
  const copy = Array.from(arr);

  for (let i = 0; i < copy.length - 2; i++) {
    const j = prng.randomInteger(i, copy.length);
    const t = copy[i];
    copy[i] = copy[j];
    copy[j] = t;
  }

  return copy;
}

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

export function pathEqual(pathA: TSPNode[], pathB: TSPNode[]) {
  if (pathA.length != pathB.length)
    return false;

  for (let i = 0; i < pathA.length; i++)
    if (pathA[i].name != pathB[i].name)
      return false;

  return true;
}

export function switchRandomTwo<T>(arr: T[], prng?: PRNG) {
  if (!prng)
    prng = new PRNG(Math.random() * Number.MAX_SAFE_INTEGER);

  arr = arr.slice(0);

  const a = prng.randomInteger(0, arr.length);
  const b = prng.randomIntegerExcept(0, arr.length, a);

  const tmp = arr[a];
  arr[a] = arr[b];
  arr[b] = tmp;

  return arr;
}