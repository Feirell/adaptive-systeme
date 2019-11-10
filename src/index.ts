import { render } from './renderer';
import { PRNG } from './prng';
import { TSPNode } from './tsp-node';

import { WorkerHelper } from './worker-helper';

interface ProcessListener { (ev: { path: TSPNode[], ts: number }): void }

async function loadAndStart(creator: string, nodes: TSPNode[], tries: number, progressListener: ProcessListener, finishedListener: ProcessListener) {
    const worker = new Worker('./worker.ts');
    const wh = new WorkerHelper(worker);
    await wh.ready;
    wh.sendMessage('create', { nodes, tries, creator })

    let best: TSPNode[] = undefined as any;

    while (true) {
        const msg = await wh.waitForAnyMessage();

        if (msg.channel != 'normal')
            if (msg.channel == 'error')
                throw new Error('received error message: ' + JSON.stringify(msg));
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

const indexToLetter = (index: number, start = 'A') => String.fromCharCode(start.charCodeAt(0) + index);

function createTSPWithRandomPoints(countNodes: number, width: number, height: number, prng?: PRNG) {
    if (!prng)
        prng = new PRNG(0x76AFF32);
    // prng = new PRNG(Math.random() * Number.MAX_SAFE_INTEGER);

    const nodes = [];
    for (let i = 0; i < countNodes; i++)
        nodes.push(new TSPNode(indexToLetter(i), prng.randomInteger(0, width), prng.randomInteger(0, height)));

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

export interface AlgorithmProgress {
    name: string;
    startTime: number;
    finishTime: undefined | number;
    steps: Improvement[];
}

const width = 400;
const height = 400;

document.addEventListener('DOMContentLoaded', async () => {
    const tsp = createTSPWithRandomPoints(10, width, height);

    // for (bestRoute of tsp.getBestRouteBruteForce()) {

    const tries = 100000;
    // await awaitClick();
    const main = document.body.children[0] as HTMLElement;
    const algorithms: AlgorithmProgress[] = [];
    const startTime = Date.now();
    for (const processor of [
        'BruteForce',
        'HillClimbing'
    ]) {
        let improvements: Improvement[] = [{ path: tsp, timestamp: startTime }];
        const ourRepresentation = { name: processor, startTime, finishTime: undefined, steps: improvements };
        algorithms.push(ourRepresentation);

        render(main, tsp, algorithms);

        loadAndStart(processor, tsp, tries,
            ({ path, ts }) => {
                improvements.push({
                    path, timestamp: ts
                });

                render(main, tsp, algorithms);
            },
            ({ path, ts }) => (ourRepresentation as any).finishTime = ts
        );
    }
});