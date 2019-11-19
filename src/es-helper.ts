import { TSPIndividual } from "./path-creator/evolutionary-algorithm";
import { fisherYatesShuffle } from "./helper";
import { PRNG } from "./prng";

export function selectRandomX<T extends TSPIndividual>(individuals: T[], amount: number, prng: PRNG) {
    return fisherYatesShuffle(individuals, prng)
        .slice(0, amount)
        .map(v => [v]);
}
