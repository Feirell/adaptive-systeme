import { NeuronalNetSimple } from './neuronal-net-helper';

const frm = (arr: any[]) => '[' + arr.join(', ') + ']';

const nn = new NeuronalNetSimple([2, 1], 1);
const result = nn.applyInput([0, 1]);
console.log(result);

const trainingSet: [number[], number[]][] = [
  [[+0, +1], [+1]],
  [[-1, +1], [+0]],
  [[+1, +1], [+1]],
  [[+0, -4], [+1]],
  [[-2, -2], [+1]]
];

for (const k of nn.trainWithDataSet(trainingSet))
  console.log('trainingResult', k.testingResult);

trainingSet.push([[-8, 2], [0]])
trainingSet.push([[200, 2], [1]])
trainingSet.push([[-900, 2], [0]])
trainingSet.push([[-0.001, 2], [0]])

for (const set of trainingSet) {
  const input = set[0];
  const expected = set[1];

  const actual = nn.applyInput(input);

  console.log(frm(input) + ' should result in ' + frm(expected) + ' but resulted in ' + frm(actual));
}