import { seedInputHelper, nodeAmountHelper, chooseHelper } from './input-helper';
import { RingBuffer } from './ring-buffer';
import { Error as ChainableError } from 'chainable-error';
import { render } from './renderer';
import { PRNG } from './prng';
import { TSPNode } from './tsp-node';

import { WorkerHelper, TransferError } from './worker-helper';

import processor from './path-creator-loader';

interface ProcessListener { (ev: { path: TSPNode[], ts: number }): void }

const isTransferError = (val: any): val is TransferError => typeof val == 'object' && 'name' in val && 'stack' in val && 'message' in val;
const transferErrorToRealError = (te: TransferError) => {
  const err = new Error()
  err.message = te.message;
  err.name = te.name;
  err.stack = te.stack;

  return err;
}

let runningWorker: Worker[] = [];

const terminateAllWorker = () => {
  for (const worker of runningWorker)
    worker.terminate();

  runningWorker = [];
}

async function loadAndStart(creator: string, nodes: TSPNode[], tries: number, progressListener: ProcessListener, finishedListener: ProcessListener) {
  const worker = new Worker('./worker.ts');
  runningWorker.push(worker);
  const wh = new WorkerHelper(worker);
  await wh.ready;
  wh.sendMessage('create', { nodes, tries, creator })

  let best: TSPNode[] = undefined as any;

  while (true) {
    const msg = await wh.waitForAnyMessage();
    if (msg.channel != 'normal')
      if (msg.channel == 'error') {
        const error = isTransferError(msg.payload) ?
          transferErrorToRealError(msg.payload) : msg.payload;

        if (isTransferError(msg.payload) && ChainableError == Error)
          throw error;
        else
          throw new ChainableError('received error message from creator ' + creator, error);
      }
      else console.info('received non normal message', msg);
    else
      switch (msg.type) {
        case 'progressed':
          best = msg.payload;
          progressListener({ path: best, ts: msg.timestamp });
          break;

        case 'finished':
          finishedListener({ path: best, ts: msg.timestamp });
          worker.terminate();
          return;

        default:
          throw new Error('received message which was not mapped ' + msg.type);
      }
  }
}

const indexToLetter = (index: number, length = 2) => {
  let remaining = index;
  let accumulated = "";

  const baseNr = 'A'.charCodeAt(0);
  for (let i = length - 1; i >= 0; i--) {
    let val = Math.floor(remaining / 26 ** i);
    remaining -= val * 26 ** i;

    accumulated += String.fromCharCode(baseNr + val);
  }

  return accumulated;
};

function createTSPWithRandomPoints(countNodes: number, width: number, height: number, prng: PRNG) {
  const nodes = new Array(countNodes);
  const identifierLength = Math.ceil(Math.log(countNodes) / Math.log(26));

  for (let i = 0; i < countNodes; i++)
    nodes[i] = new TSPNode(
      indexToLetter(i, identifierLength),
      prng.randomInteger(0, width),
      prng.randomInteger(0, height)
    );

  return nodes;
}

// const createTimeout = (ms: number) => new Promise((res, rej) => setTimeout(res, ms));
// const free = () => new Promise(res => setTimeout(res));
// const waitForFrame = () => new Promise(res => requestAnimationFrame(res));
// const awaitClick = () => new Promise(res => addEventListener('click', res));

// const FrameCounter = (() => {
//     let frameNumber = 0;

//     (async () => {
//         while (true) {
//             frameNumber++;
//             await waitForFrame();
//         }
//     })();

//     return class FrameCounter {
//         private lastFrame?: number = undefined;
//         public get currentFrame() { return frameNumber; }
//         isDifferent() {
//             const r = this.lastFrame != this.currentFrame;
//             this.lastFrame = this.currentFrame;
//             return r;
//         }
//     }
// })();

export interface Improvement {
  timestamp: number;
  path: TSPNode[];
}

export interface ImprovementWithIndex extends Improvement {
  index: number
}

export interface AlgorithmProgress {
  name: string;
  startTime?: number;
  finishTime?: number;
  steps: RingBuffer<ImprovementWithIndex>;
}

const width = 400;
const height = 400;


document.addEventListener('DOMContentLoaded', async () => {
  const seedInput = document.querySelector('#seed') as HTMLInputElement;
  const amountInput = document.querySelector('#amount') as HTMLInputElement;
  const mainElem = document.querySelector('main') as HTMLElement;
  const formElem = document.querySelector('form') as HTMLFormElement;
  const chooseAlgorithElem = document.querySelector('.choose-algorithm') as HTMLDivElement;

  let seed = 0x122312;
  let amount = 2;
  let tsp: TSPNode[] = [];
  let shouldRender = true;

  const renderLoop = () => {
    if (shouldRender) {
      shouldRender = false;
      render(mainElem, tsp, algorithms);
    }


    requestAnimationFrame(renderLoop);
  };

  requestAnimationFrame(renderLoop);

  // const tries = 10 ** 6;
  const tries = Number.MAX_VALUE;
  // const tries = 100000;
  const historyEntries = 100;


  const registeredProcessors = Array.from(processor.keys());

  let algorithms: AlgorithmProgress[] = [];

  let usedProcessors: string[] = [];

  const clean = () => {
    tsp = createTSPWithRandomPoints(amount, width, height, new PRNG(seed));

    algorithms = [];

    for (const processor of usedProcessors) {
      algorithms.push({
        name: processor,
        startTime: undefined,
        finishTime: undefined,
        steps: new RingBuffer<ImprovementWithIndex>(historyEntries)
      });
    }

    terminateAllWorker();

    shouldRender = true;
  }

  clean();

  const start = () => {
    clean();
    const startTime = Date.now();

    for (const ourRepresentation of algorithms) {
      let improvement = 0;
      let improvements = ourRepresentation.steps;
      ourRepresentation.startTime = startTime;

      shouldRender = true;

      loadAndStart(ourRepresentation.name, tsp, tries,
        ({ path, ts }) => {
          improvements.push({
            path, timestamp: ts, index: ++improvement
          });

          shouldRender = true;
        },
        ({ path, ts }) => {
          (ourRepresentation as any).finishTime = ts;
          shouldRender = true;
        }
      )
        .catch(console.error)
    }

  }

  seedInputHelper(seedInput, val => (seed = val, clean()), seed);
  nodeAmountHelper(amountInput, val => (amount = val, clean()), amount);
  formElem.addEventListener('submit', ev => (ev.preventDefault(), start()));

  chooseHelper(chooseAlgorithElem, (chosen) => (usedProcessors = chosen, clean()), registeredProcessors);

  start();
});