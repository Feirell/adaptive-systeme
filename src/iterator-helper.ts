export interface IteratorAndIterable<T, TRet = T> extends Iterator<T, TRet>, Iterable<T> { }

export function produceIteratorAndIterable<T, TRet = T>(fnc: Iterator<T, TRet>['next']): IteratorAndIterable<T, TRet> {
  const ite = {
    next: fnc,
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