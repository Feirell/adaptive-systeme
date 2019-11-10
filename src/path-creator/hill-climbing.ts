import { PathCreator } from "./path-creator";
import { TSPNode } from "../tsp-node";
import { getPathLength, switchRandomTwo } from '../helper';
import { PRNG } from "./prng";

abstract class HillClimber<T, F> {
  private finishedFlag = false;

  constructor(
    private value: T,
    private readonly allowedTries: number
  ) { }

  abstract step(current: T): T
  abstract calculateFit(value: T): F;
  abstract improved(currentFit: F, previousFit: F): boolean

  findNext() {
    let remainingTries = this.allowedTries;

    const initial = this.value;
    const initialFit = this.calculateFit(initial);

    let current = initial;
    let currentFit = initialFit;

    while (remainingTries-- > 0) {
      current = this.step(current);
      currentFit = this.calculateFit(current);

      if (this.improved(currentFit, initialFit))
        return this.value = current;
    }

    this.finishedFlag = true;
    return initial;
  }

  finished() {
    return this.finishedFlag;
  }
}

class TSPHillClimber extends HillClimber<TSPNode[], number>{
  constructor(
    nodes: TSPNode[],
    allowedTries: number,
    private readonly prng = new PRNG(10000)
  ) {
    super(nodes, allowedTries);
  }

  step(current: TSPNode[]): TSPNode[] {
    return switchRandomTwo(current, this.prng);
  }

  calculateFit(value: TSPNode[]): number {
    return getPathLength(value);
  }

  improved(currentFit: number, previousFit: number): boolean {
    return currentFit < previousFit;
  }
}

export class HillClimbing extends PathCreator {

  private hillClimber!: TSPHillClimber;

  setAvailableNodes(nodes: TSPNode[]) {
    this.availableNodes = nodes;
    this.hillClimber = new TSPHillClimber(nodes, this.numberOfTries);
  }

  step() {
    return this.hillClimber.findNext();
  }

  isFinished() {
    return this.hillClimber.finished();
  }
}