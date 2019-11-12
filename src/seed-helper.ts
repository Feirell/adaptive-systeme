interface CharacterValidator { (str: string): boolean }

const createCharRangeValidator = (ranges: [string, string][]): CharacterValidator => {
    const numberRanges: [number, number][] = [];
    for (const range of ranges) {
        let start = range[0].charCodeAt(0);
        let end = range[1].charCodeAt(0);

        if (end < start) {
            const t = start;
            start = end;
            end = t;
        }

        numberRanges.push([start, end]);
    }

    return str => numberRanges.some(v => v[0] <= str.charCodeAt(0) && str.charCodeAt(0) <= v[1])
}

const validator = createCharRangeValidator([['0', '9'], ['A', 'Z']]);

export const cleanSeedString = (str: string) => [...str].filter(validator).join('');

export const convertToSeedString = (seed: number): string => seed.toString(36).toUpperCase();
export const convertToSeedNumber = (seed: string): number => Number.parseInt(seed.toLowerCase(), 36)

console.log(convertToSeedString(Number.MAX_SAFE_INTEGER))

export function seedInputHelper(inputElem: HTMLInputElement, seedChanged: (newSeed: number) => void, initial = 0) {
    const retrieveValue = () => convertToSeedNumber(inputElem.value = cleanSeedString(inputElem.value.toUpperCase()));
    const applyValue = (val: number) => inputElem.value = convertToSeedString(val);

    let last: number = retrieveValue();

    if (initial != last) {
        seedChanged(last);
    }

    const handleChange = () => {
        let numberValue = retrieveValue();

        if (numberValue > Number.MAX_SAFE_INTEGER) {
            numberValue = Number.MAX_SAFE_INTEGER
            applyValue(numberValue);
        }

        if (numberValue != last) {
            last = numberValue;
            seedChanged(numberValue);
        }
    }

    inputElem.addEventListener('input', handleChange);
}