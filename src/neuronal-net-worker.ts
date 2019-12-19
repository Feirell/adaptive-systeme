import { NeuronalNetSimple } from './neuronal-net';
import { WorkerHelper } from './worker-helper'

const wh = new WorkerHelper();

(async () => {

    await wh.ready;

    const createMessage = await wh.waitForType('create');
    const { neuronalNet, layerDefinition } = createMessage.payload;

    if (neuronalNet != 'NeuronalNetSimple')
        throw new Error('do not have the requested net ' + neuronalNet);

    const instance = new NeuronalNetSimple(layerDefinition);

    (async () => {
        while (true) {
            const trainMessage = await wh.waitForType('train-set');
            const { trainingsSet, allowedTries = Infinity, awaitContinue = false } = trainMessage.payload;

            const training = instance.trainWithDataSet(trainingsSet, allowedTries);

            while (true) {
                const n = training.next();
                const net = instance.toJSON();
                console.log('added net', net);

                if (n.done) {
                    wh.sendMessage('training-finished', { trainingResult: n.value, net });
                    break;
                } else {
                    wh.sendMessage('training-progressed', { intermediateResult: n.value, net });
                    if (awaitContinue)
                        await wh.waitForType('training-continue');
                }
            }
        }
    })();

    (async () => {
        while (true) {
            const evaluateMessage = await wh.waitForType('evaluate-value');
            const { input } = evaluateMessage.payload;

            const result = instance.applyInput(input);

            wh.sendMessage('evaluate-result', { result });
        }
    })();

})().catch(err => wh.sendError('uncaught-error', err))