import { TSPNode } from '../tsp-node';
import { PRNG } from '../prng';

export interface PathCreatorConstructor {
  new(nodes: TSPNode[], tries: number): PathCreator
}

export abstract class PathCreator implements Iterable<TSPNode[]>, Iterator<TSPNode[]> {

  protected calls = [];

  constructor(
    protected availableNodes: TSPNode[],
    protected readonly numberOfTries: number,
    protected readonly prng = new PRNG(0x223812FF)
  ) {
    this.setAvailableNodes(availableNodes);
  }

  setAvailableNodes(availableNodes: TSPNode[]) { this.availableNodes = availableNodes; }
  getAvailableNodes() { return this.availableNodes; }

  countMinorStep() {
    const isAllowedToContinue = this.isAllowedToContinue();
    this.calls[this.calls.length - 1]++;
    return isAllowedToContinue;
  }

  minorSteps() {
    return this.calls[this.calls.length - 1];
  }

  isAllowedToContinue() {
    return this.minorSteps() < this.numberOfTries;
  }

  protected abstract step(): TSPNode[];
  protected abstract isFinished(): boolean;

  public progress() {
    this.calls.push(0);
    return this.step();
  }

  next() {
    const done = this.isFinished();
    return (done ?
      {
        done: true,
        value: undefined
      } : {
        done: false,
        value: this.progress()
      }) as { value: TSPNode[], done: boolean };
  }

  [Symbol.iterator]() {
    return this;
  }
}
