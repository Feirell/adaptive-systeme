import { TSPNode } from './tsp-node.js';
import { getPathLength } from './helper.js';
import { randomInt } from './random-int.js';

function randomIntExpect(start: number, end: number, except: number) {
  const rnd = randomInt(start, end - 1);
  return rnd >= except ? rnd + 1 : rnd;
}

function switchRandomTwo<T>(arr: T[]) {
  arr = arr.slice(0);

  const a = randomInt(0, arr.length);
  const b = randomIntExpect(0, arr.length, a);

  const tmp = arr[a];
  arr[a] = arr[b];
  arr[b] = tmp;

  return arr;
}

export class HillClimber {
  public nodes: TSPNode[];

  constructor(
    nodes: TSPNode[]
  ) {
    this.nodes = nodes;
  }

  stepHillClimbing() {
    const currentLength = getPathLength(this.nodes);
    const newRandomSwitched = switchRandomTwo(this.nodes);
    const newRandomSwitchedLength = getPathLength(newRandomSwitched);

    if (newRandomSwitchedLength < currentLength)
      this.nodes = newRandomSwitched;

    return this.nodes;
  }
}