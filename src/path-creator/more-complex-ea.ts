import { EvolutionaryAlgorithm, TSPIndividual } from "./evolutionary-algorithm"
import { TSPNode } from "../tsp-node";
import { fisherYatesShuffle, shiftRandomRange, flipRandomSection, clamp, switchRandomTwo } from "../helper";
import { selectRandomX, recombineCopy, selectBestX, selectRandomPairsOf, recombineCrossXWMappingTSP, selectTournament, selectBestXPairs } from "../es-helper";

abstract class EAWMutate extends EvolutionaryAlgorithm<TSPIndividual>{
    protected createInitialPopulation(availableNodes: TSPNode[]): TSPIndividual[] {
        const arr = new Array(this.populationSize);

        for (let i = 0; i < this.populationSize; i++)
            arr[i] = { genotype: fisherYatesShuffle(availableNodes, this.prng) };

        return arr;
    }

    private chooseRandomMutate() {
        // switch (this.prng.randomInteger(0, 3)) {
        //     case 0: return switchRandomTwo;
        //     case 1: return shiftRandomRange;
        //     case 2: return flipRandomSection;
        // }

        return flipRandomSection;
    }

    protected mutate(individual: TSPIndividual): TSPIndividual {
        let path = individual.genotype;

        for (let i = 0; i < this.mutationSize; i++)
            path = this.chooseRandomMutate()(this.prng, path);

        return { genotype: path };
    }
}

export class MoreComplexEA extends EAWMutate {
    public static readonly processorName = "EA with select best";
    // zu kleine Kind Anzahl, deshalb tastet sich das an steady state ran!
    // protected readonly childrenSize = this.populationSize * 5;

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

    // zu kleine Kind Anzahl, deshalb tastet sich das an steady state ran!
    // protected readonly childrenSize = this.populationSize * 5;

    protected readonly crossover = [
        this.availableNodes.length * 1 / 3 | 0,
        this.availableNodes.length * 2 / 3 | 0
    ];

    protected parentSelection(individuals: TSPIndividual[]): TSPIndividual[][] {
        return selectRandomPairsOf(individuals, this.childrenSize, 2, this.prng);
        // const ts = (this.populationSize) * 0.4 | 0
        // const selected = selectTournament(individuals, this.childrenSize * 2, this.prng, ts, 1, true);

        // const ret = [];
        // for (let i = 0; i < this.childrenSize; i++) {
        //     ret.push(
        //         selected[i * 2],
        //         selected[i * 2 + 1]
        //     );
        // }

        // return ret;
    }

    protected recombination(selected: TSPIndividual[]): TSPIndividual[] {
        const crossover = new Set();
        for (let i = 0; i < 2; i++) {
            crossover.add(this.prng.randomInteger(0, this.availableNodes.length));
        }
        return recombineCrossXWMappingTSP(selected[0], selected[1], Array.from(crossover.values()) as number[]);
    }

    protected environmentSelection(individuals: TSPIndividual[]): TSPIndividual[] {
        return selectBestX(individuals, this.populationSize);
    }
}

export class MoreComplexEAWTournament extends EAWMutate {
    public static readonly processorName = "EA with tournament";

    // zu kleine Kind Anzahl, deshalb tastet sich das an steady state ran!
    // protected readonly childrenSize = this.populationSize * 5;

    protected readonly crossover = [
        this.availableNodes.length * 1 / 3 | 0,
        this.availableNodes.length * 2 / 3 | 0
    ];

    protected getCurrentTournamentSize(strength = 0.5, individuals = this.populationSize + this.childrenSize) {
        // const numberOfProgressSteps = this.calls.length
        const numberOfProgressSteps = 1;
        // const tournamentSizePerc = 1 - 1 / (strength * numberOfProgressSteps + 1);
        const tournamentSizePerc = 0.2;
        // console.log(tournamentSizePerc);
        const tournamentSize = clamp(Math.floor(individuals * tournamentSizePerc), 2, individuals);
        // console.log('tournamentSize', tournamentSize);
        return tournamentSize;
    }

    protected parentSelection(individuals: TSPIndividual[]): TSPIndividual[][] {
        return selectRandomPairsOf(individuals, this.childrenSize, 2, this.prng);
    }

    protected recombination(selected: TSPIndividual[]): TSPIndividual[] {
        return recombineCrossXWMappingTSP(selected[0], selected[1], this.crossover);
    }

    protected environmentSelection(individuals: TSPIndividual[]): TSPIndividual[] {
        return selectTournament(individuals, this.populationSize, this.prng, this.getCurrentTournamentSize(), 1);
    }
}