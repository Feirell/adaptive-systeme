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

export const cleanSeedString = (str: string) => [...str].filter(validator).join('') || '0';

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

export function nodeAmountHelper(inputElem: HTMLInputElement, amountChanged: (newSeed: number) => void, initial = 0) {
    const retrieveValue = () => Number.parseInt(inputElem.value);
    const applyValue = (val: number) => inputElem.value = (val | 0).toString(10);

    let last: number = retrieveValue();

    if (initial != last) {
        amountChanged(last);
    }

    const handleChange = () => {
        let numberValue = retrieveValue();

        if (numberValue < 1) {
            numberValue = 1
            applyValue(numberValue);
        }

        if (numberValue > Number.MAX_SAFE_INTEGER) {
            numberValue = Number.MAX_SAFE_INTEGER
            applyValue(numberValue);
        }

        if (numberValue != last) {
            last = numberValue;
            amountChanged(numberValue);
        }
    }

    inputElem.addEventListener('input', handleChange);
}

export function chooseHelper(wrapper: HTMLElement, selectedChanged: (selected: string[], action: 'deselected' | 'selected', name: string) => void, available: string[], selected: boolean[] = new Array(available.length).fill(false)) {
    const cleanedAvailable: string[] = [];
    const cleanedSelected: boolean[] = [];

    for (let i = 0; i < available.length; i++) {
        if (typeof available[i] != 'string' || cleanedAvailable.indexOf(available[i]) != -1)
            continue;

        cleanedAvailable.push(available[i]);
        cleanedSelected.push(selected[i]);
    }

    const createListener = (nr: number, input: HTMLInputElement) => {
        cleanedSelected[nr] = input.checked

        return () => {
            const state = cleanedSelected[nr] = input.checked;

            (input.parentElement as Element).classList[state ? 'add' : 'remove']('chosen');

            const buildList = [];

            for (let i = 0; i < cleanedAvailable.length; i++)
                if (cleanedSelected[i])
                    buildList.push(cleanedAvailable[i]);

            selectedChanged(buildList, state ? 'selected' : 'deselected', cleanedAvailable[nr]);
        };
    }

    for (let i = 0; i < cleanedAvailable.length; i++) {
        const id = 'choose-' + i + '-' + cleanedAvailable[i];

        const input = document.createElement('input');
        input.setAttribute('type', 'checkbox');
        input.setAttribute('id', id);
        input.addEventListener('input', createListener(i, input));

        const label = document.createElement('label');
        label.setAttribute('for', id);
        label.innerText = cleanedAvailable[i];

        const lineWrapper = document.createElement('div');
        lineWrapper.append(input, label);
        wrapper.append(lineWrapper);
    }
}