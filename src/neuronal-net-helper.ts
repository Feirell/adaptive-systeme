import { produceIteratorAndIterable, IteratorAndIterable } from "./iterator-helper";

interface MultidimensionalArray<T> extends Array<T | MultidimensionalArray<T>> { }

const createArray = <T>(initialValue: T, ...dimension: number[]): MultidimensionalArray<T> => {
  if (dimension.length == 1)
    return new Array(dimension[0]).fill(initialValue) as T[];

  const ret = new Array(dimension[0]);
  const subDimension = dimension.slice(1);

  for (let i = 0; i < dimension[0]; i++)
    ret[i] = createArray(initialValue, ...subDimension);

  return ret;
}

class WeightMemory {
  private readonly backing: number[];

  constructor(
    public readonly inNumber: number,
    public readonly outNumber: number,
    readonly defaultWeight = 1
  ) {
    this.backing = createArray(defaultWeight, inNumber * outNumber) as number[];
    Object.freeze(this);
  }

  private checkRange(val: number, name: 'in' | 'out') {
    if (!Number.isInteger(val))
      throw new TypeError(name + ' needs to be an integer');

    if (val < 0)
      throw new RangeError(name + ' needs to be greater or equal to 0');

    const max = this[name + 'Number'];
    if (val >= max)
      throw new RangeError(name + ' needs to be less than ' + max);
  }

  get(inIndex: number, outIndex: number) {
    this.checkRange(inIndex, 'in');
    this.checkRange(outIndex, 'out');

    return this.backing[this.outNumber * inIndex + outIndex];
  }

  set(inIndex: number, outIndex: number, val: number) {
    this.checkRange(inIndex, 'in');
    this.checkRange(outIndex, 'out');

    return this.backing[this.outNumber * inIndex + outIndex] = val;
  }
}

type TrainingsSet = [number[], number[]][];

interface LearningResult {
  testingResult: number[][];
  remainingTries: number;
}

abstract class NeuronalNet {

  weights: WeightMemory[];

  constructor(
    private readonly layerDefinition: number[],
    private learningRate = 1,
    defaultWeight = 1
  ) {
    if (layerDefinition.length < 2)
      throw new RangeError("layerDefinition need to have at least two layers (input and output layer)");

    this.weights = [];

    for (let i = 1; i < layerDefinition.length; i++) {
      const inNumber = layerDefinition[i - 1];
      const outNumber = layerDefinition[i];

      const wm = new WeightMemory(inNumber + 1, outNumber, defaultWeight);
      this.weights.push(wm);

      // setting the threshold of the first negative
      for (let o = 0; o < outNumber; o++)
        wm.set(0, o, -defaultWeight);
    }
  }

  abstract activationFunction(accumulated: number): number;

  applyInput(inputValues: number[]): number[] {
    if (inputValues.length != this.layerDefinition[0])
      throw new RangeError('inputValues needs to be the same length as ' + this.layerDefinition[0]); let prevResult = inputValues;

    for (const weights of this.weights) {
      const nextResult = new Array(weights.outNumber) as number[];
      for (let i = 0; i < nextResult.length; i++) {
        // static weight has the same role as a threshold, which would be multiplied by 1
        let accumulated = weights.get(0, i);

        for (let k = 1; k < weights.inNumber; k++)
          // k - 1 since the first weight does not have a relating prev result
          accumulated += weights.get(k, i) * prevResult[k - 1];


        nextResult[i] = this.activationFunction(accumulated);
      }

      prevResult = nextResult;
    }

    return prevResult;
  }

  supervisedOnlineLearning(trainingSet: TrainingsSet) {
    const testingResult = createArray(0, trainingSet.length, trainingSet[1].length) as number[][];

    if (this.layerDefinition.length > 2)
      throw new RangeError('can not learn for hidden layers');

    // go through all training set data
    for (let i = 0; i < trainingSet.length; i++) {
      const currentInput = trainingSet[i][0];
      const currentExpected = trainingSet[i][1];
      const currentWeight = this.weights[0];

      const actualResult = this.applyInput(currentInput);

      if (currentExpected.length != actualResult.length)
        throw new RangeError('expected was another length then the actual result');

      // comparing the result vector with the expected results
      for (let k = 0; k < actualResult.length; k++) {
        const expected = currentExpected[k];
        const actual = actualResult[k];

        // if this part of the vector is not correct, recalibrate the weight
        if (actual != expected) {
          testingResult[i][k]++;

          for (let w = 0; w < currentWeight.inNumber; w++) {
            const input = w == 0 ? 1 : currentInput[w - 1];
            const newWeight = currentWeight.get(w, k) + this.learningRate * (expected - actual) * input;
            currentWeight.set(w, k, newWeight);
          }
        }
      }
    }

    return testingResult;
  }

  trainWithDataSet(trainingSet: TrainingsSet, allowedTries: number = Infinity) {
    let testingResult: number[][];
    let tries = 0;

    return produceIteratorAndIterable<LearningResult, 'resolved' | 'aborted'>(() => {
      let wasAtLeastOneWrong = false;

      setLoop: for (const testResultSet of testingResult)
        for (const testResultNodeResult of testResultSet)
          if (testResultNodeResult > 0) {
            wasAtLeastOneWrong = true;
            break setLoop;
          }

      if (!wasAtLeastOneWrong)
        return { done: true, value: 'resolved' };

      if (tries >= allowedTries)
        return { done: true, value: 'aborted' };

      testingResult = this.supervisedOnlineLearning(trainingSet);

      tries++;

      return { done: false, value: { testingResult, remainingTries: allowedTries - tries } };
    });
  }

  trainTillFinished(trainingSet: TrainingsSet, allowedTries: number = Infinity) {
    const ite = this.trainWithDataSet(trainingSet, allowedTries);

    while (true) {
      const n = ite.next();

      if (n.done)
        return n.value;
    }

  }
}

export class NeuronalNetSimple extends NeuronalNet {
  activationFunction(accumulated: number): number {
    return accumulated >= 0 ? 1 : 0;
  }
}