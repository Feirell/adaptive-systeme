import { EvolutionaryAlgorithm, TSPIndividual, sortBest } from "./evolutionary-algorithm"
import { TSPNode } from "../tsp-node";
import { fisherYatesShuffle, shiftRandomRange, flipRandomSection, clamp } from "../helper";
import { selectRandomX, recombineCopy, selectBestX, selectRandomPairsOf, recombineCrossXWMapping, recombineCrossXWMappingTSP } from "../es-helper";

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
        return selectRandomX(individuals, this.childrenSize, this.prng).map(v => [v]);
    }

    protected recombination(selected: TSPIndividual[]): TSPIndividual[] {
        return recombineCopy(selected);
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
        return selectBestX(individuals, this.populationSize);
    }
}

export class MoreComplexEAWRecomb extends EvolutionaryAlgorithm<TSPIndividual>{
    public static readonly processorName = "MoreComplexEAWRecomb";
    protected readonly childrenSize = this.populationSize * 0.50 | 0;

    protected readonly crossover = [
        this.availableNodes.length * 1 / 3 | 0,
        this.availableNodes.length * 2 / 3 | 0
    ]

    // protected readonly switchAmount = clamp(this.availableNodes.length * 0.15 | 0, 1, 3);
    protected readonly switchAmount = 1;

    protected createInitialPopulation(availableNodes: TSPNode[]): TSPIndividual[] {
        const arr = new Array(this.populationSize);

        for (let i = 0; i < this.populationSize; i++)
            arr[i] = { phenotype: fisherYatesShuffle(availableNodes, this.prng) };

        return arr;
    }

    protected parentSelection(individuals: TSPIndividual[]): TSPIndividual[][] {
        return selectRandomPairsOf(individuals, this.childrenSize, 2, this.prng);
    }

    protected recombination(selected: TSPIndividual[]): TSPIndividual[] {
        return recombineCrossXWMappingTSP(selected[0], selected[1], this.crossover);
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
        return selectBestX(individuals, this.populationSize);
    }
}