import { TSPNode } from "./tsp-node.js";
import { getPathLength, fisherYatesShuffle, getCombinationOnlyUnique, pathEqual } from './helper.js';

export class TSPMap {
  constructor(
    public nodes: TSPNode[]
  ) { }

  *getRandomRoute() {
    yield fisherYatesShuffle(this.nodes);
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

}