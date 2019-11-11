import { getPathLength, fisherYatesShuffle, switchRandomTwo, turnTwoAround, isPathBetter, pathCompare } from '../helper';
import { PathCreator } from './path-creator';
import { TSPNode } from '../tsp-node';

interface TSPIndividual {
    phenotype: TSPNode[];
}

const individualCombination = (a: TSPIndividual, b: TSPIndividual) =>
    pathCompare(a.phenotype, b.phenotype);

const sortBest = (individuum: TSPIndividual[]) => Array.from(individuum).sort(individualCombination);

const isIndividuumBetter = (a: TSPIndividual, b: TSPIndividual) => isPathBetter(a.phenotype, b.phenotype);

const findBestIndividuum = (individuals: TSPIndividual[]) => {
    let best = individuals[0];

    for (let i = 1; i < individuals.length; i++)
        if (individualCombination(best, individuals[i]) == 1)
            best = individuals[i];

    return best;
}

abstract class EvolutionaryAlgorithm<Individual extends TSPIndividual> extends PathCreator {
    protected readonly populationSize = 100;
    protected population: null | Individual[] = null;

    private finished = false;
    private lastBest = this.doGeneration();

    protected step(): TSPNode[] {
        for (let tries = 0; tries < this.numberOfTries; tries++) {
            const current = this.doGeneration();
            if (isPathBetter(current, this.lastBest)) {
                return this.lastBest = current;
            } else if ((tries % 10000) == 0)
                console.log('trying for', tries);
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
            let newPopulation: Individual[] = [];
            const selectedParents = this.parentSelection(this.population);

            for (const parents of selectedParents) {
                const recombinationResult = this.recombination(parents);

                newPopulation = newPopulation.concat(
                    recombinationResult.parents,
                    recombinationResult.children.map(c => this.mutate(c))
                );
            }

            this.population = this.environmentSelection(newPopulation);
        }

        return findBestIndividuum(this.population).phenotype;
    }

    protected abstract createInitialPopulation(availableNodes: TSPNode[]): Individual[];

    protected abstract parentSelection(individuals: Individual[]): Individual[][];
    protected abstract recombination(parents: Individual[]): { parents: Individual[], children: Individual[] };
    protected abstract mutate(individual: Individual): Individual;
    protected abstract environmentSelection(individuals: Individual[]): Individual[];
}



export class SimpleEA extends EvolutionaryAlgorithm<TSPIndividual>{
    protected readonly childrenSize = (this.populationSize * 0.75) | 0;

    protected createInitialPopulation(availableNodes: TSPNode[]): TSPIndividual[] {
        const arr = new Array(this.populationSize);
        for (let i = 0; i < this.populationSize; i++)
            arr[i] = { phenotype: fisherYatesShuffle(availableNodes, this.prng) };

        return arr;
    }

    protected parentSelection(individuals: TSPIndividual[]): TSPIndividual[][] {
        return fisherYatesShuffle(individuals, this.prng)
            .slice(0, this.childrenSize)
            .map(v => [v]);
    }

    protected recombination(parents: TSPIndividual[]): { parents: TSPIndividual[]; children: TSPIndividual[]; } {
        return {
            parents: parents,
            children: [{ phenotype: parents[0].phenotype.slice(0) }]
        };
    }

    protected mutate(individual: TSPIndividual): TSPIndividual {
        return { phenotype: turnTwoAround(individual.phenotype, this.prng) };
    }

    protected environmentSelection(individuals: TSPIndividual[]): TSPIndividual[] {
        return sortBest(individuals).slice(0, this.populationSize);
    }
}