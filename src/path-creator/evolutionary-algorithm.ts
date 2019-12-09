import { isPathBetter, pathCompare, clamp } from '../helper';
import { PathCreator } from './path-creator';
import { TSPNode } from '../tsp-node';

export interface TSPIndividual {
    genotype: TSPNode[];
}

const individualCombination = (a: TSPIndividual, b: TSPIndividual) =>
    pathCompare(a.genotype, b.genotype);

export const sortBest = <T extends TSPIndividual>(individuum: T[]) => Array.from(individuum).sort(individualCombination);

// const isIndividuumBetter = (a: TSPIndividual, b: TSPIndividual) => isPathBetter(a.genotype, b.genotype);

const findBestIndividuum = (individuals: TSPIndividual[]) => {
    let best = individuals[0];

    for (let i = 1; i < individuals.length; i++)
        if (individualCombination(best, individuals[i]) == 1)
            best = individuals[i];

    return best;
}

export abstract class EvolutionaryAlgorithm<Individual extends TSPIndividual> extends PathCreator {
    protected readonly populationSize = 10;
    protected readonly childrenSize = clamp(Math.floor(this.populationSize * 0.5), 1);
    // protected readonly mutationSize = clamp(Math.floor(Math.log10(this.availableNodes.length)), 1, 3);
    protected readonly mutationSize = 1;

    protected population: null | Individual[] = null;

    private finished = false;
    private lastBest: TSPNode[];

    protected step(): TSPNode[] {
        if (!this.lastBest)
            return this.lastBest = this.doGeneration();

        for (let tries = 0; tries < this.numberOfTries; tries++) {
            const current = this.doGeneration();
            if (isPathBetter(current, this.lastBest))
                return this.lastBest = current;
        }

        this.finished = true;
        return this.lastBest;
    }

    protected isFinished(): boolean {
        return this.finished;
    }

    protected doGeneration() {
        if (this.population == null)
            this.population = this.createInitialPopulation(this.availableNodes);
        else {
            const selectedParents = this.parentSelection(this.population);
            const createdChildren: Individual[][] = [];

            for (const parents of selectedParents) {
                const recombinationResult = this.recombination(parents);

                const mutatedChildren = [];

                for (const child of recombinationResult)
                    mutatedChildren.push(this.mutate(child));

                createdChildren.push(mutatedChildren);
            }

            const newPopulation = this.combineToNewPopulation(selectedParents, createdChildren);
            this.population = this.environmentSelection(newPopulation);
        }

        return findBestIndividuum(this.population).genotype;
    }

    protected abstract createInitialPopulation(availableNodes: TSPNode[]): Individual[];

    protected abstract parentSelection(individuals: Individual[]): Individual[][];
    protected abstract recombination(selected: Individual[]): Individual[];

    protected combineToNewPopulation(parents: Individual[][], children: Individual[][]): Individual[] {
        return Array.prototype.concat.apply([], parents.concat(children));
    }

    protected abstract mutate(individual: Individual): Individual;
    protected abstract environmentSelection(individuals: Individual[]): Individual[];
}

