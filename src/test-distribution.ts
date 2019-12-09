import { PRNG } from './prng'

const prng = new PRNG(0);

const width = 6;

const map = new Map<string, number>();
const setValue = (a: number, b: number, value: number) => map.set(a + ':' + b, value);
const getValue = (a: number, b: number) => map.get(a + ':' + b);

for (let a = 0; a < width; a++)
  for (let b = 0; b < width; b++)
    setValue(a, b, 0);


const pickTwo = (range: number) => {
  const a = prng.randomInteger(0, range);
  const b = prng.randomIntegerExcept(0, range, a);

  return { a, b };
}

const testSize = 10 ** 5;

for (let i = 0; i < testSize; i++) {
  const { a, b } = pickTwo(width);
  setValue(a, b, getValue(a, b) + 1);
}

let log = "";
for (let a = 0; a < width; a++)
  for (let b = 0; b < width; b++) {
    log +=
      setValue(a, b, 0);
  }
