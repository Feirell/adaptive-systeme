import { PRNG } from './prng';
import { TSPNode } from './tsp-node';

const { abs, pow, sqrt } = Math;
export function getDistance(a: TSPNode, b: TSPNode): number {
  return sqrt(pow(abs(a.x - b.x), 2) + pow(abs(a.y - b.y), 2))
}

const lengthCache: unique symbol = Symbol("lengthCache");
const hasCachedLength = (nodes: TSPNode[]): nodes is TSPNode[] & { [lengthCache]: number } => lengthCache in nodes;
export function getPathLength(nodes: TSPNode[]): number {
  // if (hasCachedLength(nodes))
  // return nodes[lengthCache] as number;

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


  // Object.defineProperty(nodes, lengthCache, { value: length, configurable: false, enumerable: false })
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


const cyclicAt = (rangeLength: number, length: number) =>
  Math.max((rangeLength - length) * rangeLength, length);

export function shiftRandomRange<T>(prng: PRNG, arr: T[]) {

  const start = prng.randomInteger(0, arr.length);
  const length = prng.randomInteger(1, arr.length);
  const shiftDelta = prng.randomInteger(1, cyclicAt(arr.length, length))

  return shiftRange(arr, start, length, shiftDelta);
}

export function shiftRange<T>(arr: T[], start: number, length: number, shiftDelta: number) {
  // console.log('shiftRange', ...arguments);
  const arrLength = arr.length;

  shiftDelta %= cyclicAt(arrLength, length);

  // this trick loop solves the problem, it is not good, but it will work
  let ret;
  do {
    ret = arr.slice(0);
    const intermediateShiftDelta = Math.min(shiftDelta, arrLength - length);

    // places the displaces items at their correct new position, this part produces the above error
    for (let off = 0; off < intermediateShiftDelta; off++) {

      let actualIndex = (start + off) % arrLength;
      let cameFrom = (start + off + length) % arrLength;

      ret[actualIndex] = arr[cameFrom];
    }

    // place the moving part [start,start+length) to the right position
    for (let off = 0; off < length; off++) {
      const actualIndex = (start + intermediateShiftDelta + off) % arrLength;
      const cameFrom = (start + off) % arrLength;

      ret[actualIndex] = arr[cameFrom];
    }

    start += intermediateShiftDelta;
    shiftDelta -= intermediateShiftDelta;
    arr = ret;
  } while (shiftDelta > 0)

  return ret;
}

export function flipRandomSection<T>(prng: PRNG, arr: T[]) {
  const start = prng.randomInteger(0, arr.length);
  const length = prng.randomInteger(1, arr.length);

  return flipSection(arr, start, length);
}

export function flipSection<T>(arr: T[], start: number, length: number) {
  // console.log('flip section was called')
  const newArr = arr.slice(0);

  for (let i = 0; i < Math.floor(length / 2); i++) {
    const from = (start + i) % arr.length;
    const to = (start + length - i - 1) % arr.length;

    newArr[from] = arr[to];
    newArr[to] = arr[from];
  }

  return newArr;
}

export function clamp(value: number, min: number, max: number) {
  if (value < min)
    return min;

  if (value > max)
    return max;

  return value;
}