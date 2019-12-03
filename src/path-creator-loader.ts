import modules from './path-creator/{brute-force,local-search,simple-ea,more-complex-ea,ant-colony}.ts';
import { PathCreatorConstructor } from './path-creator/path-creator';

const processors = new Map<string, PathCreatorConstructor>();

for (const module of Object.values(modules))
    for (const processor of Object.values(module))
        if (typeof processor == 'function')
            if (processors.has(processor.processorName))
                throw new Error('processor ' + processor.processorName + 'was already registered');
            else
                processors.set(processor.processorName, processor);

export default processors;