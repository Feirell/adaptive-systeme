import { arrayEqual } from './helper';
import { WorkerHelper } from './worker-helper';

const frm = (arr: any[]) => '[' + arr.join(', ') + ']';

(async () => {
  const wh = new WorkerHelper(new Worker('./neuronal-net-worker.ts'));

  await wh.ready;

  wh.sendMessage('create', {
    neuronalNet: 'NeuronalNetSimple',
    layerDefinition: [2, 1]
  });

  const trainingsSet: [number[], number[]][] = [
    [[+0, +1], [+1]],
    [[-1, +1], [+0]],
    [[+1, +1], [+1]],
    [[+0, -4], [+1]],
    [[-2, -2], [+1]]
  ];

  wh.sendMessage('train-set', { trainingsSet });

  while (true) {
    const msg = await wh.waitForAnyMessage();

    if (msg.type == 'training-finished') {
      console.log('finished because ' + msg.payload.trainingResult);
      break;
    } else if (msg.type == 'training-progressed') {
      console.log('progressed training', msg.payload.intermediateResult);
    }
  }

  // add some other data just to check if it will work on that too
  trainingsSet.push([[-8, 2], [0]])
  trainingsSet.push([[200, 2], [1]])
  trainingsSet.push([[-900, 2], [0]])
  trainingsSet.push([[-0.001, 2], [0]])

  for (const set of trainingsSet) {
    const input = set[0];
    const expectedResult = set[1];

    wh.sendMessage('evaluate-value', { input });
    const result = await wh.waitForType('evaluate-result');

    const actualResult = result.payload.result;

    const logPrefix = arrayEqual(expectedResult, actualResult) ? '[RIGHT]' : '[WRONG]';
    console.log(logPrefix + ' tested ' + frm(input) + ' which should result in ' + frm(expectedResult) + ' and resulted in ' + frm(actualResult))
  }

})().catch(err => console.error('uncaught error', err));