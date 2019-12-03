export interface IteratorAndIterable<T> extends Iterator<T, T>, Iterable<T> { }

export function produceIteratorAndIterable<T>(fnc: Iterator<T>['next']): IteratorAndIterable<T> {
  const ite = {
    next: () => fnc(),
    [Symbol.iterator]: () => ite
  };

  return ite;
}

export function extendIterable<V, U>(iterable: Iterator<V>, mapper: (val: V) => U): IteratorAndIterable<U> {
  return produceIteratorAndIterable(() => {
    const n = iterable.next();
    const done = n.done;
    const value = n.value;

    return { done, value: done ? undefined : mapper(value) };
  });
}