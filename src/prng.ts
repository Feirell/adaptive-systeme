// taken from https://gist.github.com/blixt/f17b47c62508be59987b

const makeUnique = <T>(arr: T[]) => Array.from(arr).sort().filter((v, i, a) => a.indexOf(v) == i);

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

  randomIntegerExceptUnordered(min: number, max: number, except: number[], inclusive = false) {
    this.randomIntegerExcept(min, max, makeUnique(except), inclusive);
  }

  randomIntegerExcept(min: number, max: number, except: number | number[], inclusive = false) {
    if (typeof except == 'number')
      except = [except];

    except.length
    let rnd = this.randomInteger(min, max - except.length, inclusive);

    for (const exc of except) {
      if (rnd < exc)
        return rnd;
      else if (rnd >= exc)
        rnd++;
    }

    return rnd;
  }
}