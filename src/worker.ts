// console.log('here is the worker!');
import { WorkerHelper } from './worker-helper';
import { PathCreator, PathCreatorConstructor } from './path-creator/path-creator';
import modules from './path-creator/{brute-force,hill-climbing,evolutionary-algorithm}.ts';
import { TSPNode } from './tsp-node';

// console.log('processors', modules, typeof modules, modules instanceof Object);


const processors = new Map<string, PathCreatorConstructor>();

for (const module of Object.values(modules))
    for (const processor of Object.values(module))
        if (typeof processor == 'function')
            if (processors.has(processor.name))
                throw new Error('processor ' + processor.name + 'was already registered');
            else
                processors.set(processor.name, processor);

console.log('loaded:', Array.from(processors.keys()));

const waitMs = (ms: number) => new Promise(res => setTimeout(res, ms));

const wh = new WorkerHelper();
(async () => {
    await wh.ready;

    const createMessage = await wh.waitForType('create');
    const { creator, nodes, tries } = createMessage.payload;

    if (!processors.has(creator)) {
        wh.sendMessage('creator-not-found');
        return;
    }

    const processorInstance = new (processors.get(creator))(nodes, tries);
    for (const progress of processorInstance) {
        wh.sendMessage('progressed', progress);
        // await waitMs(10);
    }

    wh.sendMessage('finished');
})().catch(err => wh.sendError('uncaught-error', err))
