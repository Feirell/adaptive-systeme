import { EvolutionaryAlgorithm, TSPIndividual, sortBest } from "./evolutionary-algorithm"
import { TSPNode } from "../tsp-node";
import { fisherYatesShuffle, turnTwoAround } from "../helper";



export class MoreComplexEA extends EvolutionaryAlgorithm<TSPIndividual>{
    public static readonly processorName = "MoreComplexEA";
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
        let path = turnTwoAround(individual.phenotype, this.prng);
        return { phenotype: path };
    }

    protected environmentSelection(individuals: TSPIndividual[]): TSPIndividual[] {
        return sortBest(individuals).slice(0, this.populationSize);
    }
}