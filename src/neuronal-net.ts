import { arrayEqual } from './helper';
import { WorkerHelper } from './worker-helper';
import { renderNeuronalNet, ErrorResult } from './neuronal-net-render';

const frm = (arr: any[]) => '[' + arr.join(', ') + ']';

const createRenderLoop = (fnc: () => void) => {
  let shouldRender = true;
  let cancel = false;

  const loop = () => {
    if (cancel)
      return;

    if (shouldRender)
      fnc();

    shouldRender = false;

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  return {
    shouldRender: () => { shouldRender = true; },
    cancelCycle: () => { cancel = true; }
  }
}

class EventProxy {
  private readonly registered = new Set<() => void>();

  register(fnc: () => void) {
    return this.registered.add(fnc);
  }

  unregister(fnc: () => void) {
    return this.registered.delete(fnc);
  }

  dispatch() {
    for (const fnc of this.registered.values())
      try {
        fnc();
      } catch (e) {
        console.error(e);
      }
  }

  registerAsPromise() {
    return new Promise((res) => {
      const listener = () => {
        this.unregister(listener);
        res();
      }

      this.register(listener);
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('root') as HTMLElement;
  const wh = new WorkerHelper(new Worker('./neuronal-net-worker.ts'));

  let errorResult = [] as ErrorResult;
  let net = [];

  let continueClick = new EventProxy();

  const render = createRenderLoop(() => {
    renderNeuronalNet({
      continueClick: () => continueClick.dispatch(),
      root,
      net,
      errorResult
    });
  });

  await wh.ready;
  const awaitContinue = true;
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

  wh.sendMessage('train-set', { trainingsSet, awaitContinue });

  while (true) {
    const msg = await wh.waitForAnyMessage();

    if (msg.type == 'training-finished') {
      console.log('finished because ' + msg.payload.trainingResult);
      break;
    } else if (msg.type == 'training-progressed') {
      errorResult = msg.payload.intermediateResult.testingResult;
      render.shouldRender();
      console.log('progressed training', errorResult);
      if (awaitContinue) {
        await continueClick.registerAsPromise();
        wh.sendMessage('training-continue');
      }
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

});

//)().catch(err => console.error('uncaught error', err));