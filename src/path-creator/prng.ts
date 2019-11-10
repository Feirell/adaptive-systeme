// taken from https://gist.github.com/blixt/f17b47c62508be59987b
export class PRNG {
  private seed: number;

  constructor(seed: number) {
    seed |= 0;
    seed %= (2 ** 31 - 1);

    if (seed <= 0)
      seed += (2 ** 31 - 2);

    this.seed = seed;
  }

  next() {
    return this.seed = this.seed * 48271 % (2 ** 31 - 1);
  }

  nextFloat() {
    return (this.next() - 1) / (2 ** 31 - 2);
  }

  randomInteger(min: number, max: number, inclusive = false) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(this.nextFloat() * (max - min + (inclusive as any))) + min;
  }

  randomIntegerExcept(min: number, max: number, except: number, inclusive = false) {
    let rnd = this.randomInteger(min, max - 1, inclusive);
    return rnd >= except ? rnd + 1 : rnd;
  }
}