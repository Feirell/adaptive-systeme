import { HillClimber } from "./hill-climb.js";
import { TSPNode } from "./tsp-node.js";
import { getPathLength, fisherYatesShuffle, getCombinationOnlyUnique } from './helper.js';

/*
class ValueCache {
  constructor(
    private readonly valueAmount: number
  ) {
    if ((valueAmount | 0) !== valueAmount || valueAmount < 1)
      throw new Error('valueAmount needs to be an integer greater than or equal to 1');
  }

  // set(...keys:) {

  // }
}
*/

function pathEqual(pathA: TSPNode[], pathB: TSPNode[]) {
  if (pathA.length != pathB.length)
    return false;

  for (let i = 0; i < pathA.length; i++)
    if (pathA[i].name != pathB[i].name)
      return false;

  return true;
}

export class TSPMap {
  constructor(
    public nodes: TSPNode[]
  ) { }

  getRandomRoute(): TSPNode[] {
    return fisherYatesShuffle(this.nodes);
  }

  *getBestRouteBruteForce() {
    let shortestLength: number | null = null;
    let shortestPath: TSPNode[] = [];

    for (const variation of getCombinationOnlyUnique(this.nodes, this.nodes.length)) {
      let length = getPathLength(variation)

      if (!shortestLength || shortestLength > length) {
        shortestLength = length;
        shortestPath = variation;
        yield variation;
      }
    }

    return shortestPath;
  }

  *getHillClimbedRoute(equalCountAbort = 50) {
    const hc = new HillClimber(this.nodes);

    let best = hc.stepHillClimbing();
    let prev = best;

    let equalCount = 0;

    while (equalCount < equalCountAbort) {
      const current = hc.stepHillClimbing();
      // console.log(current, prev);
      if (pathEqual(current, prev))
        equalCount++;
      else {
        equalCount = 0;
        yield best = current;
      }
    }

    return best;
  }
}