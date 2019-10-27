import { TSPNode } from './tsp-node.js';

export function getDistance(a: TSPNode, b: TSPNode): number {
  const { abs, pow, sqrt } = Math;
  return sqrt(pow(abs(a.x - b.x), 2) + pow(abs(a.y - b.y), 2))
}

export function getPathLength(nodes: TSPNode[]): number {
  let length = 0;

  if (nodes.length > 1) {
    let last: TSPNode = nodes[0];
    for (const n of nodes.slice(1)) {
      length += getDistance(last, n);
      last = n;
    }
    length += getDistance(nodes[0], last);
  }

  return length;
}

import { randomInt } from "./random-int.js";

export function fisherYatesShuffle<T>(arr: T[]) {
  const copy = Array.from(arr);

  for (let i = 0; i < copy.length - 2; i++) {
    const j = randomInt(i, copy.length);
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
