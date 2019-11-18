import { PRNG } from './prng';
import { TSPNode } from './tsp-node';

const { abs, pow, sqrt } = Math;
export function getDistance(a: TSPNode, b: TSPNode): number {
  return sqrt(pow(abs(a.x - b.x), 2) + pow(abs(a.y - b.y), 2))
}

const lengthCache: unique symbol = Symbol("lengthCache");
const hasCachedLength = (nodes: TSPNode[]): nodes is TSPNode[] & { [lengthCache]: number } => lengthCache in nodes;
export function getPathLength(nodes: TSPNode[]): number {
  if (hasCachedLength(nodes))
    return nodes[lengthCache] as number;

  if (nodes.length <= 1)
    throw new Error('length can not be calculated for an path with one or non nodes');

  let length = 0;
  let last: TSPNode = nodes[0];

  for (let i = 1; i < nodes.length; i++) {
    const n = nodes[i];
    length += getDistance(last, n);
    last = n;
  }

  length += getDistance(nodes[0], last);


  Object.defineProperty(nodes, lengthCache, { value: length, configurable: false, enumerable: false })
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

export function pathEqual(pathA: TSPNode[], pathB: TSPNode[]) {
  if (pathA.length != pathB.length)
    return false;

  for (let i = 0; i < pathA.length; i++)
    if (pathA[i].name != pathB[i].name)
      return false;

  return true;
}

function switchTwo<T>(arr: T[], a: number, b: number) {
  const copy = Array.from(arr);

  const tmp = copy[a];
  copy[a] = copy[b];
  copy[b] = tmp;

  return copy;
}

export function switchRandomTwo<T>(arr: T[], prng?: PRNG) {
  if (!prng)
    prng = new PRNG(Math.random() * Number.MAX_SAFE_INTEGER);

  const a = prng.randomInteger(0, arr.length);
  const b = prng.randomIntegerExcept(0, arr.length, a);

  return switchTwo(arr, a, b);
}

export function turnTwoAround<T>(arr: T[], prng?: PRNG) {
  if (!prng)
    prng = new PRNG(Math.random() * Number.MAX_SAFE_INTEGER);

  const a = prng.randomInteger(0, arr.length);

  return switchTwo(arr, a, (a + 1) % arr.length);
}

export function isPathBetter(a: TSPNode[], b: TSPNode[]) {
  return pathCompare(a, b) == -1;
}

export function pathCompare(a: TSPNode[], b: TSPNode[]) {
  const delta = getPathLength(a) - getPathLength(b);

  if (delta < 0)
    return -1;

  if (delta > 0)
    return 1;

  return 0;
}

export function switchRandomRange<T>(arr: T[], start: number, length: number, shiftDelta: number) {
  // shift length amount elements from start to start + shiftDelta, be aware of array length limitations
}