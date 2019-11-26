// algorithm DL-distance is
//     input: strings a[1..length(a)], b[1..length(b)]
//     output: distance, integer
/*function damerauLevenshtein(a: number[], b: number[], sizeOfAlphabet: number): number {

    //     da := new array of |Σ| integers
    const da = new Array(sizeOfAlphabet)
        //     for i := 1 to |Σ| inclusive do
        //         da[i] := 0
        .fill(0);

    //     let d[−1..length(a), −1..length(b)] be a 2-d array of integers, dimensions length(a)+2, length(b)+2
    //     // note that d has indices starting at −1, while a, b and da are one-indexed.
    const d = new Array(a.length + 2);
    for (let i = 0; i < d.length; i++)
        d[i] = new Array(b.length + 2)
            .fill(0);

    //     maxdist := length(a) + length(b)
    const maxDist = a.length + b.length;
    //     d[−1, −1] := maxdist
    d[0][0] = maxDist;

    //     for i := 0 to length(a) inclusive do
    for (let i = 1; i <= a.length + 1; i++) {
        //         d[i, −1] := maxdist
        d[i][0] = maxDist;
        //         d[i, 0] := i
        d[i][1] = i;
    }

    //     for j := 0 to length(b) inclusive do
    for (let j = 1; j <= b.length + 1; j++) {
        //         d[−1, j] := maxdist
        d[0][j] = maxDist;
        //         d[0, j] := j
        d[1][j] = j;
    }

    //     for i := 1 to length(a) inclusive do
    for (let i = 0; i < a.length; i++) {
        //         db := 0
        let db = 0;
        //         for j := 1 to length(b) inclusive do
        for (let j = 0; j < b.length; j++) {
            //             k := da[b[j]]
            let k = da[b[j]];
            //             ℓ := db
            let l = db;
            //             if a[i] = b[j] then
            let cost;
            if (a[i] == b[j]) {
                //                 cost := 0
                cost = 0;
                db = j;
                //                 db := j
            }
            //             else
            else
                //                 cost := 1
                cost = 1;

            //             d[i, j] := minimum(d[i−1, j−1] + cost,  //substitution
            d[i][j] = Math.min(d[i + 1][j + 1] + cost,
                //                                d[i,   j−1] + 1,     //insertion
                d[i + 2][j] + 1,
                //                                d[i−1, j  ] + 1,     //deletion
                d[i + 1][j + 2] + 1,
                //                                d[k−1, ℓ−1] + (i−k−1) + 1 + (j-ℓ−1)) //transposition
                d[k + 1][l + 1] + (i + 1 - k - 1) + 1 + (j + 1 - l - 1)
            );
        }
        //         da[a[i]] := i
        da[a[i]] = i + 1;
    }
    //     return d[length(a), length(b)]
    return d[a.length - 1][b.length - 1];
}
*/

// https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance

const damerauLevenshtein = (a: number[], b: number[], i: number = a.length - 1, j: number = b.length - 1): number => {
    let min;

    if (i == j)
        min = 0;

    if (i >= 0) {
        const t = damerauLevenshtein(a, b, i - 1, j) + 1;
        if (!min || t < min)
            min = t;
    }

    if (j >= 0) {
        const t = damerauLevenshtein(a, b, i, j - 1) + 1;
        if (!min || t < min)
            min = t;
    }

    if (i >= 0 && j >= 0) {
        const t = damerauLevenshtein(a, b, i - 1, j - 1) + (a[i] == b[j] ? 0 : 1);
        if (!min || t < min)
            min = t;
    }

    if (i >= 1 && j >= 1 && a[i] == b[j - 1] && a[i - 1] == b[j]) {
        const t = damerauLevenshtein(a, b, i - 2, j - 2) + 1;
        if (!min || t < min)
            min = t;
    }

    return min;
}

const stringToNumberArray = (str: string) => Array.from(str).map(v => {
    const charCode = v.charCodeAt(0);

    if (charCode >= 97 && charCode <= 122)
        return charCode - 97 + 26;

    if (charCode >= 65 && charCode <= 90)
        return charCode - 65;

    throw new Error('could not map character');
})

document.addEventListener('DOMContentLoaded', () => {
    const [first, second] = document.getElementsByTagName('input');
    const output = document.getElementsByTagName('output')[0];

    let firstInput = first.value;
    let secondInput = second.value;

    const update = () => {
        const firstNumber = stringToNumberArray(firstInput);
        const secondNumber = stringToNumberArray(secondInput);

        const result = damerauLevenshtein(firstNumber, secondNumber);
        output.value = JSON.stringify({ firstInput, firstNumber, secondInput, secondNumber, result }, undefined, 2);
    }

    first.addEventListener('input', ev => (firstInput = first.value, update()));
    second.addEventListener('input', ev => (secondInput = second.value, update()));

    update();
});