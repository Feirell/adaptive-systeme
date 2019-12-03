import { WorkerHelper } from './worker-helper';
import processors from './path-creator-loader';

const waitMs = (ms: number) => new Promise(res => setTimeout(res, ms));

const wh = new WorkerHelper();
(async () => {
    await wh.ready;

    const createMessage = await wh.waitForType('create');
    const { creator, nodes, tries } = createMessage.payload;

    if (!processors.has(creator)) {
        wh.sendError('creator-not-found', 'creator ' + creator + ', only loaded ' + [...processors.keys()].join(', '));
        return;
    }

    console.debug('registered: ' + JSON.stringify(Array.from(processors.keys())) + ' and starting: ' + creator);

    const processorInstance = new (processors.get(creator))(nodes, tries);
    for (const progress of processorInstance) {
        wh.sendMessage('progressed', progress);
        // await waitMs(50);
    }

    wh.sendMessage('finished');
})().catch(err => wh.sendError('uncaught-error', err))
