import { produceIteratorAndIterable } from "./iterator-helper";

export class BooleanMemory implements Iterable<boolean> {
    private readonly backing: Uint32Array;

    constructor(
        private readonly size: number,
        initial = false
    ) {
        if (!Number.isInteger(size) && typeof size != 'bigint')
            throw new TypeError('size needs to be an integer');

        if (size < 1)
            throw new RangeError('size neeeds to be greater or equal to one');

        try {
            this.backing = new Uint32Array(Math.ceil(size / 32));
        } catch (e) {
            if (e instanceof RangeError)
                throw new RangeError('can not create a BooleanMemory for ' + size + ' booleans (it would require ' + new Intl.NumberFormat().format(Math.ceil(size / 8)) + ' byte memory)');

            throw e;
        }

        if (initial)
            this.reset(true);

        Object.freeze(this);
    }

    private isViableIndex(v: number): never | void {
        if (!Number.isInteger(v))
            throw new TypeError('index needs to be an integer');

        if (v < 0 || v >= this.size)
            throw new Error('index needs to be in [0,size)');
    }

    get(i: number) {
        this.isViableIndex(i);

        const backingNr = i / 32 | 0;
        const comparator = 1 << i % 32;

        return (this.backing[backingNr] & comparator) != 0;
    }

    set(i: number, v: boolean) {
        this.isViableIndex(i);

        if (v !== !!v)
            throw new TypeError('v needs to be an boolean')

        const backingNr = i / 32 | 0;
        const comparator = 1 << i % 32;

        if (v)
            this.backing[backingNr] |= comparator;
        else
            this.backing[backingNr] ^= comparator;
    }

    reset(to: boolean = false) {
        const v = to ? 2 ** 33 - 1 : 0;

        for (let i = 0; i < this.backing.length; i++)
            this.backing[i] = v;
    }

    copy() {
        const val = new BooleanMemory(this.size);
        val.backing.set(this.backing);
        return val;
    }

    [Symbol.iterator]() {
        let index = 0;

        return produceIteratorAndIterable(() => {
            if (index >= this.size)
                return { done: true, value: false };

            return { done: false, value: this.get(index++) };
        });
    }

    toArray(): boolean[] {
        return Array.from(this);
    }
}