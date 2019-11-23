import { IteratorAndIterable, UniqueIndexCombiner, checkParameter, createHelper } from './unique-index-helper';

const { getGroupLengthDefinition,
    amountOfCombinations } = createHelper(BigInt, Map);

const bigIntZero = BigInt(0);

export class UniqueBigIndexCombinationMap implements IteratorAndIterable<Map<bigint, bigint>>{
    private currentIndex = bigIntZero;

    private readonly letters: bigint;
    private readonly places: bigint;

    private readonly groupLength: Map<bigint, bigint>;
    private readonly maxCombinations: bigint;

    constructor(
        letters: number | bigint,
        places: number | bigint = letters
    ) {
        this.letters = BigInt(letters);
        this.places = BigInt(places);

        this.groupLength = getGroupLengthDefinition(this.letters, this.places);
        this.maxCombinations = amountOfCombinations(this.letters, this.places);
    }

    atIndex(currentIndex: bigint) {
        if (currentIndex >= this.maxCombinations || currentIndex < bigIntZero)
            return null;

        const places = this.places;

        const currentConfig = new Map<bigint, bigint>();
        const currentConfigUsed = new Map<bigint, boolean>();

        for (let p = bigIntZero; p < places; p++) {
            const group = /* implicit floor */ currentIndex / (this.groupLength.get(p) as bigint);
            const inGroupCount = group % (this.letters - p);

            let actualIndex = inGroupCount;

            for (let u = bigIntZero; u < places; u++)
                if (currentConfigUsed.has(u) && actualIndex >= u)
                    actualIndex++;

            currentConfigUsed.set(actualIndex, true);
            currentConfig.set(p, actualIndex);
        }

        return currentConfig;
    }

    next() {
        const next = this.atIndex(this.currentIndex);

        if (next == null)
            return { done: true, value: undefined as any };
        else {
            this.currentIndex++
            return { done: false, value: next };
        }
    }

    [Symbol.iterator]() {
        return this;
    }
}

export class UniqueBigIndexCombination implements UniqueIndexCombiner {
    private readonly internalCombiner: UniqueBigIndexCombinationMap;

    private readonly places: number;
    private readonly letters: number;

    private currentIndex = bigIntZero;

    constructor(letters: number, places: number) {
        checkParameter('letters', letters);
        checkParameter('places', places, 32);

        this.places = places;
        this.letters = letters;
        this.internalCombiner = new UniqueBigIndexCombinationMap(letters, places);
    }

    atIndex(index: number | bigint) {
        const val = this.internalCombiner.atIndex(BigInt(index));

        if (val == null)
            return null;

        const ret = new Array(this.places);

        for (let i = 0; i < this.places; i++)
            ret[i] = Number(val.get(BigInt(i)));

        return ret;
    }

    next() {
        const val = this.atIndex(this.currentIndex);

        if (val == null)
            return { done: true, value: undefined as any };
        else {
            this.currentIndex++;
            return { done: false, value: val };
        }
    }

    [Symbol.iterator]() {
        return this;
    }
}
