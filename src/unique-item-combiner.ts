
// import './old';

// throw void null;

interface IteratorAndIterable<T> extends Iterator<T, T>, Iterable<T> { }

const faculty = (n: number, bottom = 1) => {
    let acc = 1;

    while (n > bottom)
        acc *= n--;

    return acc;
}

const getGroupLength = (group: number, letters: number, width: number) =>
    faculty(letters - 1 - group, letters - width);

const amountOfCombinations = (letters: number, places: number) =>
    faculty(letters, letters - places)

const getGroupLengthDefinition = (letters: number, places: number) => {
    const groupLength = new Uint32Array(places);
    for (let k = 0; k < places; k++)
        groupLength[k] = getGroupLength(k, letters, places);

    return groupLength;
}

export class UniqueIndexCombination implements IteratorAndIterable<number[]> {
    private currentIndex = 0;

    private readonly groupLength = getGroupLengthDefinition(this.letters, this.places);
    private readonly maxCombinations = amountOfCombinations(this.letters, this.places);

    constructor(
        private readonly letters: number,
        private readonly places: number = letters
    ) { }

    next() {
        if (this.currentIndex < this.maxCombinations) {
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



            this.currentIndex++;

            return { done: false, value: currentConfig };
        } else
            return { done: true, value: undefined as any };
    }

    [Symbol.iterator]() {
        return this;
    }
}

export class UniqueItemCombination<T> implements IteratorAndIterable<T[]>{
    private readonly indexCombinator: UniqueIndexCombination;

    constructor(
        private readonly items: T[],
        private readonly combinationLength = items.length
    ) {
        this.indexCombinator = new UniqueIndexCombination(items.length);
    }

    next() {
        const comb = this.indexCombinator.next();

        if (comb.done)
            return comb;
        else {
            const cl = this.combinationLength;

            const actual: T[] = new Array(cl);
            for (let i = 0; i < cl; i++)
                actual[i] = this.items[comb.value[i]];

            return { done: false, value: actual };
        }
    }

    [Symbol.iterator]() {
        return this;
    }
}

const makeIterAndIter = <T>(step: () => T): IteratorAndIterable<T> => {
    const iter: IteratorAndIterable<T> = {
        next: () => ({ value: step(), done: false }),
        [Symbol.iterator]: () => iter
    }
    return iter;
}