import { EvolutionaryAlgorithm, TSPIndividual } from "./evolutionary-algorithm";
import { TSPNode } from "../tsp-node";
import { fisherYatesShuffle, turnTwoAround } from "../helper";
import { recombineCopy, selectBestX, selectRandomX } from "../es-helper";

export class SimpleEA extends EvolutionaryAlgorithm<TSPIndividual>{
    public static readonly processorName = "SimpleEA";
    protected readonly childrenSize = (this.populationSize * 0.75) | 0;

    protected createInitialPopulation(availableNodes: TSPNode[]): TSPIndividual[] {
        const arr = new Array(this.populationSize);
        for (let i = 0; i < this.populationSize; i++)
            arr[i] = { phenotype: fisherYatesShuffle(availableNodes, this.prng) };

        return arr;
    }

    protected parentSelection(individuals: TSPIndividual[]): TSPIndividual[][] {
        return selectRandomX(individuals, this.childrenSize, this.prng).map(v => [v]);
    }

    protected recombination(parents: TSPIndividual[]): TSPIndividual[] {
        return recombineCopy(parents);
    }

    protected mutate(individual: TSPIndividual): TSPIndividual {
        let path = turnTwoAround(this.prng, individual.phenotype);
        return { phenotype: path };
    }

    protected environmentSelection(individuals: TSPIndividual[]): TSPIndividual[] {
        return selectBestX(individuals, this.populationSize);
    }
}