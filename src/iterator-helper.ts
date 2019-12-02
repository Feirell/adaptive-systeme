export interface IteratorAndIterable<T> extends Iterator<T, T>, Iterable<T> { }

export function produceIteratorAndIterable<T>(fnc: () => { done: boolean, value: undefined | T }): IteratorAndIterable<T> {
  const ite = {
    next: () => fnc,
    [Symbol.iterator]: () => ite
  };

  return
}