import { TSPNode } from '../tsp-node';
import { PathCreator } from './path-creator';
import { getPathLength } from '../helper';
import { UniqueItemCombination } from '../unique-item-combiner';

export class BruteForce extends PathCreator {
  public static readonly processorName = "BruteForce";

  private readonly allCombination = new UniqueItemCombination(this.availableNodes.slice(0));
  private shortestLength: number;
  private shortestPath: TSPNode[];
  private done = false;

  constructor(nodes: TSPNode[], tries: number) {
    super(nodes, tries);

    this.shortestLength = getPathLength(nodes);
    this.shortestPath = nodes;
  }

  step(): TSPNode[] {

    for (const variation of this.allCombination) {
      if (!this.countMinorStep())
        break;

      let length = getPathLength(variation);
      if (!this.shortestLength || length < this.shortestLength) {
        this.shortestLength = length;
        this.shortestPath = variation;
        return variation;
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