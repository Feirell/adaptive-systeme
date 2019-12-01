import { getDistance } from '../helper';
import { PathCreator } from './path-creator';
import { TSPNode } from '../tsp-node';
import { TSPEdgeMemory } from '../edge-memory';

interface EdgeInformation {
    pheromon: number;
    heuristically: number;
}

export class AntColony extends PathCreator {
    private edgeInformations: TSPEdgeMemory<EdgeInformation>;

    setAvailableNodes(availableNodes: TSPNode[]) {
        this.availableNodes = availableNodes;
        this.edgeInformations = new TSPEdgeMemory(availableNodes);
        this.initializeEdges();
    }

    protected initializeEdges() {
        this.edgeInformations.forEach((a, b) => {
            this.edgeInformations.set(a, b, {
                pheromon: this.prng.nextFloat(),
                heuristically: getDistance(a, b)
            });
        });
    }

    protected step(): TSPNode[] {

    }

    protected isFinished(): boolean {
        throw new Error("Method not implemented.");
    }
}