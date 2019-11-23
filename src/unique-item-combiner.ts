import { UniqueIndexCombination } from "./unique-index-combiner";
import { UniqueBigIndexCombination } from "./unique-big-index-combiner";
import { isSafeCombination, UniqueIndexCombiner } from "./unique-index-helper";

interface IteratorAndIterable<T> extends Iterator<T, T>, Iterable<T> { }

export const getUniqueIndexCombiner = (letters: number, places: number): UniqueIndexCombiner =>
    isSafeCombination(letters, places) ?
        new UniqueIndexCombination(letters, places) :
        new UniqueBigIndexCombination(letters, places);

export class UniqueItemCombination<T> implements IteratorAndIterable<T[]>{
    private readonly indexCombiner: UniqueIndexCombiner;

    constructor(
        private readonly items: T[],
        private readonly combinationLength = items.length
    ) {
        this.indexCombiner = getUniqueIndexCombiner(items.length, items.length);
    }

    next() {
        const comb = this.indexCombiner.next();

        if (comb.done)
            return { done: true, value: undefined as any };
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