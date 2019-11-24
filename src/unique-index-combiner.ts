import { UniqueIndexCombiner, checkParameter, NumberHelper } from './unique-index-helper';

const { amountOfCombinations, getGroupLengthDefinition } = NumberHelper;

export class UniqueIndexCombination implements UniqueIndexCombiner {
    private currentIndex = 0;

    private readonly groupLength: Uint32Array;
    private readonly maxCombinations: number;

    private readonly letters: number;
    private readonly places: number;

    constructor(
        letters: number,
        places: number = letters
    ) {
        checkParameter('letters', letters);
        checkParameter('places', places, 32);

        this.places = places;
        this.letters = letters;

        this.groupLength = getGroupLengthDefinition(this.letters, this.places);
        this.maxCombinations = amountOfCombinations(this.letters, this.places);

        if (!Number.isSafeInteger(this.maxCombinations))
            throw new RangeError('can not use UniqueIndexCombination for ' + this.letters + ' letters and ' + this.places + ' places, since letters! / (letters-places)! > Number.MAX_SAFE_INTEGER, consider unsing UniqueBigIndexCombination');
    }

    atIndex(index: number) {
        if (index >= this.maxCombinations)
            return null;

        const places = this.places;

        const currentConfig = new Array(places);
        const currentConfigUsed = new Array(places).fill(false);

        for (let p = 0; p < places; p++) {
            const group = Math.floor(this.currentIndex / this.groupLength[p]);
            const inGroupCount = group % (this.letters - p);

            let actualIndex = inGroupCount;
            for (let u = 0; u < places; u++)
                if (currentConfigUsed[u] && actualIndex >= u)
                    actualIndex++;

            currentConfigUsed[actualIndex] = true;
            currentConfig[p] = actualIndex;
        }

        return currentConfig;
    }

    next() {
        const next = this.atIndex(this.currentIndex);
        if (next == null)
            return { done: true, value: undefined as any };
        else {
            this.currentIndex++;
            return { done: false, value: next };
        }
    }

    [Symbol.iterator]() {
        return this;
    }
}