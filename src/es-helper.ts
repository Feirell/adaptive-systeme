import { TSPIndividual, sortBest } from "./path-creator/evolutionary-algorithm";
import { fisherYatesShuffle } from "./helper";
import { PRNG } from "./prng";

export function recombineCopy<T extends TSPIndividual>(selected: T[]) {
    const resulting = [] as T[];

    for (const parent of selected)
        (resulting as any).push({
            phenotype: parent.phenotype.slice(0)
        } as TSPIndividual);

    return resulting;
}

export function selectRandomX<T extends TSPIndividual>(individuals: T[], amount: number, prng: PRNG) {
    return fisherYatesShuffle(individuals, prng)
        .slice(0, amount);
}

export function selectBestX<T extends TSPIndividual>(individuals: T[], amount: number) {
    return sortBest(individuals)
        .slice(0, amount)
}