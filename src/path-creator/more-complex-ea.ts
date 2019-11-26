import { EvolutionaryAlgorithm, TSPIndividual } from "./evolutionary-algorithm"
import { TSPNode } from "../tsp-node";
import { fisherYatesShuffle, shiftRandomRange, flipRandomSection, clamp, switchRandomTwo } from "../helper";
import { selectRandomX, recombineCopy, selectBestX, selectRandomPairsOf, recombineCrossXWMappingTSP, selectTournament, selectBestXPairs } from "../es-helper";

abstract class EAWMutate extends EvolutionaryAlgorithm<TSPIndividual>{
    protected createInitialPopulation(availableNodes: TSPNode[]): TSPIndividual[] {
        const arr = new Array(this.populationSize);

        for (let i = 0; i < this.populationSize; i++)
            arr[i] = { phenotype: fisherYatesShuffle(availableNodes, this.prng) };

        return arr;
    }

    private chooseRandomMutate() {
        switch (this.prng.randomInteger(0, 3)) {
            case 0: return switchRandomTwo;
            case 1: return shiftRandomRange;
            case 2: return flipRandomSection;
        }
    }

    protected mutate(individual: TSPIndividual): TSPIndividual {
        let path = individual.phenotype;

        for (let i = 0; i < this.mutationSize; i++)
            path = this.chooseRandomMutate()(this.prng, path);

        return { phenotype: path };
    }
}

export class MoreComplexEA extends EAWMutate {
    public static readonly processorName = "EA with select best";

    protected parentSelection(individuals: TSPIndividual[]): TSPIndividual[][] {
        return selectRandomX(individuals, this.childrenSize, this.prng).map(v => [v]);
    }

    protected recombination(selected: TSPIndividual[]): TSPIndividual[] {
        return recombineCopy(selected);
    }

    protected environmentSelection(individuals: TSPIndividual[]): TSPIndividual[] {
        return selectBestX(individuals, this.populationSize);
    }
}

export class MoreComplexEAWRecomb extends EAWMutate {
    public static readonly processorName = "EA with recombination";

    protected readonly crossover = [
        this.availableNodes.length * 1 / 3 | 0,
        this.availableNodes.length * 2 / 3 | 0
    ];

    protected parentSelection(individuals: TSPIndividual[]): TSPIndividual[][] {
        return selectRandomPairsOf(individuals, this.childrenSize, 2, this.prng);
    }

    protected recombination(selected: TSPIndividual[]): TSPIndividual[] {
        return recombineCrossXWMappingTSP(selected[0], selected[1], this.crossover);
    }

    protected environmentSelection(individuals: TSPIndividual[]): TSPIndividual[] {
        return selectBestX(individuals, this.populationSize);
    }
}

export class MoreComplexEAWTournament extends EAWMutate {
    public static readonly processorName = "EA with tournament";

    protected readonly crossover = [
        this.availableNodes.length * 1 / 3 | 0,
        this.availableNodes.length * 2 / 3 | 0
    ];

    protected getCurrentTournamentSize(strength = 0.05, individuals = this.populationSize) {
        const numberOfProgressSteps = this.calls.length
        const tournamentSizePerc = 1 - 1 / (strength * numberOfProgressSteps + 1);
        return clamp(Math.floor(individuals * tournamentSizePerc), 2, individuals);
    }

    protected parentSelection(individuals: TSPIndividual[]): TSPIndividual[][] {
        return selectBestXPairs(individuals, this.childrenSize);
    }

    protected recombination(selected: TSPIndividual[]): TSPIndividual[] {
        return recombineCrossXWMappingTSP(selected[0], selected[1], this.crossover);
    }

    protected environmentSelection(individuals: TSPIndividual[]): TSPIndividual[] {
        return selectTournament(individuals, this.populationSize, this.prng, this.getCurrentTournamentSize(), 1);
    }
}