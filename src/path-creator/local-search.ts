import { PathCreator } from "./path-creator";
import { TSPNode } from "../tsp-node";
import { getPathLength, switchRandomTwo, getDistance, pathEqual } from '../helper';
import { PRNG } from "../prng";

abstract class LocalSearch<T> {
    private finishedFlag = false;

    private history: T[] = [];

    constructor(
        value: T,
        private readonly allowedTries: number
    ) {
        this.history.push(value);
    }

    abstract step(current: T): T
    abstract accepting(history: T[], currentVariation: T): boolean

    findNext() {
        let remainingTries = this.allowedTries;

        const initial = this.history[this.history.length - 1];

        while (remainingTries-- > 0) {
            const current = this.step(initial);

            if (this.accepting(this.history, current)) {
                this.history.push(current);
                return current;
            }
        }

        this.finishedFlag = true;
        return initial;
    }

    finished() {
        return this.finishedFlag;
    }
}

abstract class TSPLocalSearch extends LocalSearch<TSPNode[]>{
    constructor(
        nodes: TSPNode[],
        allowedTries: number,
        readonly prng = new PRNG(10000)
    ) {
        super(nodes, allowedTries);
    }

    step(current: TSPNode[]): TSPNode[] {
        return switchRandomTwo(this.prng, current);
    }

    calculateFit(value: TSPNode[]): number {
        return getPathLength(value);
    }
}

type ConfigAcceptFunction = (this: ConfigurableLocalSearch, history: TSPNode[][], currentVariation: TSPNode[]) => boolean;

class ConfigurableLocalSearch extends TSPLocalSearch {

    constructor(
        public accepting: ConfigAcceptFunction,
        value: TSPNode[],
        allowedTries: number
    ) {
        super(value, allowedTries);
    }
}

const createLocalSearch = (name: string, fnc: ConfigAcceptFunction) =>
    class LocalSearchPathCreator extends PathCreator {
        public static readonly processorName = name;
        private hillClimber!: TSPLocalSearch;

        setAvailableNodes(nodes: TSPNode[]) {
            this.availableNodes = nodes;
            this.hillClimber = new ConfigurableLocalSearch(fnc, nodes, this.numberOfTries);
        }

        step() {
            return this.hillClimber.findNext();
        }

        isFinished() {
            return this.hillClimber.finished();
        }
    }

export const hillClimber = createLocalSearch('hill climbing', function (history, current) {
    const last = history[history.length - 1];
    return getPathLength(last) > getPathLength(current);
});

export const simulatedAnnealing1 = createLocalSearch('simulated annealing 1', function (history, current) {
    const prng = this.prng as PRNG;

    const steps = history.length;
    const last = history[history.length - 1];

    const pathFitDistanceFactor = 0.00000000005;

    const pathFitDistance = getPathLength(last) - getPathLength(current);

    if (pathFitDistance > 0)
        return true;
    else {
        const temperature = 0.95 ** steps;

        const needsToBeSmallerThen = Math.pow(Math.E, - (-pathFitDistance * pathFitDistanceFactor) / temperature);

        return prng.nextFloat() < needsToBeSmallerThen;
    }
});

export const simulatedAnnealing2 = createLocalSearch('simulated annealing 2', function (history, current) {
    const prng = this.prng as PRNG;

    const steps = history.length;
    const last = history[history.length - 1];

    const stepsExponent = 2;
    const fitDistanceExponent = 2;

    const pathFitDistance = getPathLength(last) - getPathLength(current);

    if (pathFitDistance > 0)
        return true;
    else {
        const pathFitPart = (-pathFitDistance) ** fitDistanceExponent;
        const stepsPart = steps ** stepsExponent;
        const needsToBeSmallerThen = (1 / (1 + pathFitPart + stepsPart));

        return prng.nextFloat() < needsToBeSmallerThen;
    }
});

export const thresholdAccepting = createLocalSearch('threshold accepting', function (history, current) {
    const steps = history.length;
    const last = history[history.length - 1];

    const tMultiplier = 5200;

    const pathFitDistance = getPathLength(last) - getPathLength(current);

    if (pathFitDistance > 0)
        return true;
    else
        return (-pathFitDistance) < tMultiplier * 0.99 ** steps;

});

export const recordToRecord = createLocalSearch('record to record', function (history, current) {
    const steps = history.length;
    const last = history[history.length - 1];

    let best = history[0];
    for (let i = 1; i < history.length; i++)
        if (getPathLength(history[i]) < getPathLength(best))
            best = history[i];

    const tMultiplier = 5200;

    const pathFitDistance = getPathLength(best) - getPathLength(current);

    if (pathFitDistance > 0)
        return true;
    else
        return (-pathFitDistance) < tMultiplier * 0.99 ** steps;

});

export const greatDeluge = createLocalSearch('great deluge', function (history, current) {
    return getPathLength(current) < 100000 / (1 + 0.05 * history.length);
});
