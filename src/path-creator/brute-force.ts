import { TSPNode } from '../tsp-node';
import { PathCreator } from './path-creator';
import { getPathLength, getCombinationOnlyUnique } from '../helper';

export class BruteForce extends PathCreator {
  private readonly allCombination = getCombinationOnlyUnique(this.availableNodes);
  private shortestLength: number;
  private shortestPath: TSPNode[];
  private done = false;

  constructor(nodes: TSPNode[], tries: number) {
    super(nodes, tries);

    this.shortestLength = getPathLength(nodes);
    this.shortestPath = nodes;
  }

  step(): TSPNode[] {
    let variation;

    while (variation = this.allCombination.next(), !variation.done && variation.value && this.countMinorStep()) {
      const variationValue = variation.value;
      let length = getPathLength(variationValue);
      if (!this.shortestLength || length < this.shortestLength) {
        this.shortestLength = length;
        this.shortestPath = variationValue;
        return variationValue;
      }
    }

    if (this.shortestPath == undefined) {
      this.done = true;
      throw new Error('there are no available combinations');
    }

    // console.log('this.callCount', this.callCount);

    this.done = true;
    return this.shortestPath;
  }

  isFinished(): boolean {
    return this.done;
  }
}