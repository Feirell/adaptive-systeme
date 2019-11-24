const isUsableCreator = <T>(creator: (arg: number) => T): void | never => {
    let couldUse = false;
    try {
        // @ts-ignore: left hand side should only be number but T is only extended of number
        couldUse = creator(3) + creator(-4) == creator(-1)
    } catch (e) {
        throw new Error('')
    }

    if (!couldUse)
        throw new Error('could not use the provided creator since the result was wrong (tried 3 - 4 == -1)');

}

const isTypedArray = (val: any) => Object.create(val.prototype) instanceof Object.getPrototypeOf(Int8Array).constructor;
const isNormalArray = (val: any): val is ArrayConstructor => Object.create(val.prototype) instanceof Array;

export const createHelper = <T, I>(
    creator: (args: number) => T,
    arrayCreator: new (length: number) => I
) => {
    isUsableCreator(creator);

    const zero = creator(0);
    const one = creator(1);

    const faculty = (n: T, bottom = one) => {
        let acc = one;

        while (n > bottom)
            // @ts-ignore: left hand side should only be number but T is only extended of number
            acc *= n--;

        return acc;
    }

    const getGroupLength = (group: T, letters: T, width: T) =>
        // @ts-ignore
        faculty(letters - one - group, letters - width);

    const amountOfCombinations = (letters: T, places: T) =>
        // @ts-ignore
        faculty(letters, letters - places)

    const getGroupLengthDefinition =
        isNormalArray(arrayCreator) || isTypedArray(arrayCreator) ?
            (letters: T, places: T) => {
                // @ts-ignore
                const groupLength = new arrayCreator(places);
                // @ts-ignore
                for (let k = zero; k < places; k++)
                    groupLength[k] = getGroupLength(k, letters, places);

                return groupLength;
            } :
            (letters: T, places: T) => {
                // @ts-ignore
                const groupLength = new arrayCreator();
                // @ts-ignore
                for (let k = zero; k < places; k++)
                    groupLength.set(k, getGroupLength(k, letters, places));

                return groupLength;
            }

    return { faculty, getGroupLength, amountOfCombinations, getGroupLengthDefinition };
}

export const NumberHelper = createHelper<number, number[]>(Number, Array);

export interface IteratorAndIterable<T> extends Iterator<T, T>, Iterable<T> { }

export interface UniqueIndexCombiner<
    IndexType = number,
    ReturnValue = number,
    CollectionType extends Iterable<ReturnValue> = Array<ReturnValue>
    > extends IteratorAndIterable<CollectionType> {

    atIndex(number: IndexType): CollectionType | null;
}

export const checkParameter = (name: string, value: any, max?: number) => {
    if (!Number.isInteger(value))
        throw new TypeError(name + " needs to be an integer");

    if (value <= 0)
        throw new RangeError(name + " was less or qual to zero");

    if (max === undefined || max >= 53) {
        if (!Number.isSafeInteger(value))
            throw new RangeError(name + " is not a safe integer (greater then 2^53 - 1)");
    } else {
        if (value > 2 ** max - 1)
            throw new RangeError(name + " is greater than the amount of items an array can contain (2^" + max + "-1)");
    }
}

export const isSafeCombination = (letters: number, places: number) =>
    Number.isSafeInteger(NumberHelper.amountOfCombinations(letters, places))