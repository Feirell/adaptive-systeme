import { TSPIndividual, sortBest } from "./path-creator/evolutionary-algorithm";
import { fisherYatesShuffle, clamp } from "./helper";
import { PRNG } from "./prng";

export function recombineCopy<T extends TSPIndividual>(selected: T[]) {
    const resulting = [] as T[];

    for (const parent of selected)
        (resulting as any).push({
            genotype: parent.genotype.slice(0)
        } as TSPIndividual);

    return resulting;
}

export function selectRandomX<T extends TSPIndividual>(individuals: T[], amount: number, prng: PRNG) {
    return fisherYatesShuffle(individuals, prng)
        .slice(0, amount);
}

// export function selectRandomPairsOf<T extends TSPIndividual>(individuals: T[], groups: number, groupSize: number, prng: PRNG) {
//     if (groupSize * groups > individuals.length)
//         throw new RangeError('requested ' + groups + ' with a length of ' + groupSize + ' results in needed ' + (groupSize * groups) + ' elements but only' + individuals.length + ' where given');

//     const shuffled = fisherYatesShuffle(individuals, prng);

//     const ret = new Array(groups);

//     for (let group = 0; group < groups; group++)
//         ret[group] = shuffled.slice(group * groupSize, (group + 1) * groupSize);

//     return ret;
// }

export function selectRandomPairsOf<T extends TSPIndividual>(individuals: T[], groups: number, groupSize: number, prng: PRNG) {
    // console.log('selectBestXPairs')
    const pairs = [];

    if (groupSize != 2)
        throw new RangeError('not supporting group size != 2');

    for (let group = 0; group < groups; group++) {
        const a = prng.randomInteger(0, individuals.length);
        const b = prng.randomIntegerExcept(0, individuals.length, a);
        // console.log(a, b);
        pairs.push([individuals[a], individuals[b]])
    }
    // const shuffled = fisherYatesShuffle(individuals, prng);

    // const ret = new Array(groups);

    // for (let group = 0; group < groups; group++)
    //     ret[group] = shuffled.slice(group * groupSize, (group + 1) * groupSize);
    // console.log(pairs);
    return pairs;
}

export function selectBestX<T extends TSPIndividual>(individuals: T[], amount: number) {
    return sortBest(individuals)
        .slice(0, amount)
}

export function selectTournament<T extends TSPIndividual>(
    individuals: T[],
    amount: number,
    prng: PRNG,
    tournamentSize: number = individuals.length * 0.1,
    tournamentWinner: number = 1,
    reuse = true
) {
    if (!reuse && amount > individuals.length)
        throw new Error('can not not reuse and get more than individuals as are present');

    tournamentSize = Math.round(tournamentSize);
    tournamentSize = clamp(tournamentSize, 1, Infinity);

    let ret: T[] = [];

    while (ret.length < amount) {
        individuals = fisherYatesShuffle(individuals, prng);
        const winner = selectBestX(individuals.slice(0, tournamentSize), tournamentWinner);

        ret = ret.concat(winner);

        if (!reuse) {
            individuals = individuals.filter(v => !winner.includes(v));
        }
    }

    return ret;
}

export function recombineCrossXWMappingTSP<T extends TSPIndividual>(a: T, b: T, crossover: number[]): T[] {
    return [{ genotype: recombineCrossXWMapping(a.genotype, b.genotype, crossover) } as any as T];
}

export function recombineCrossXWMapping<T>(a: T[], b: T[], crossover: number[], comparator: (a: T, b: T) => boolean = (a, b) => a == b) {

    let ret = a.slice();
    const from = new Array(ret.length).fill(false);

    let using = false;
    for (let i = 0; i < ret.length; i++) {
        if (crossover.includes(i))
            using = !using;

        if (using) {
            ret[i] = b[i];
            from[i] = true;
        }
    }

    for (let i = 0; i < ret.length; i++) {
        // did not find the element before the current one, this element is not a duplicate
        let found = false;
        for (let k = 0; k < i; k++)
            if (comparator(ret[k], ret[i])) {
                found = true;
                break;
            }

        if (!found)
            continue;

        let newElement = ret[i];

        const originatedFrom = !from[i] ? a : b;
        const lookInto = !from[i] ? b : a;

        search: while (true) {
            let posInLookInto;
            for (let u = 0; u < ret.length; u++)
                if (comparator(lookInto[u], newElement)) {
                    posInLookInto = u;
                    break;
                }

            newElement = originatedFrom[posInLookInto];

            for (let k = 0; k < i; k++)
                if (comparator(ret[k], newElement))
                    continue search;

            break;
        }

        ret[i] = newElement;
    }

    return ret;
}