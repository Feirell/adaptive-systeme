import { EvolutionaryAlgorithm, TSPIndividual, sortBest } from "./evolutionary-algorithm"
import { TSPNode } from "../tsp-node";
import { fisherYatesShuffle, shiftRandomRange, flipRandomSection, clamp } from "../helper";
import { selectRandomX } from "../es-helper";

export class MoreComplexEA extends EvolutionaryAlgorithm<TSPIndividual>{
    public static readonly processorName = "MoreComplexEA";
    protected readonly childrenSize = this.populationSize * 0.75 | 0;

    // protected readonly switchAmount = clamp(this.availableNodes.length * 0.15 | 0, 1, 3);
    protected readonly switchAmount = 1;

    protected createInitialPopulation(availableNodes: TSPNode[]): TSPIndividual[] {
        const arr = new Array(this.populationSize);

        for (let i = 0; i < this.populationSize; i++)
            arr[i] = { phenotype: fisherYatesShuffle(availableNodes, this.prng) };

        return arr;
    }

    protected parentSelection(individuals: TSPIndividual[]): TSPIndividual[][] {
        return selectRandomX(individuals, this.childrenSize, this.prng);
    }

    protected recombination(parents: TSPIndividual[]): { parents: TSPIndividual[]; children: TSPIndividual[]; } {
        return {
            parents: parents,
            children: [{ phenotype: parents[0].phenotype.slice(0) }]
        };
    }

    protected mutate(individual: TSPIndividual): TSPIndividual {
        // console.log('switchAmount', this.switchAmount);
        let path = individual.phenotype;

        if (this.prng.nextFloat() < 0.5)
            for (let i = 0; i < this.switchAmount; i++)
                path = shiftRandomRange(this.prng, path);
        else
            for (let i = 0; i < this.switchAmount; i++)
                path = flipRandomSection(this.prng, path);

        return { phenotype: path };
    }

    protected environmentSelection(individuals: TSPIndividual[]): TSPIndividual[] {
        // console.log('switchAmount', this.switchAmount);
        return sortBest(individuals).slice(0, this.populationSize);
    }
}