import { getDistance, getBest, getPathLength, containsEdge } from '../helper';
import { PathCreator } from './path-creator';
import { TSPNode } from '../tsp-node';
import { TSPEdgeMemory, Edge } from '../edge-memory';

interface EdgeInformation {
    pheromone: number;
    heuristically: number;
}

export class AntColony extends PathCreator {
    private readonly alpha = 1;
    private readonly beta = 1;
    private readonly evaporationRate = 0.2;
    private readonly fitScale = 0.2;

    private edgeInformations: TSPEdgeMemory<EdgeInformation>;

    setAvailableNodes(availableNodes: TSPNode[]) {
        this.availableNodes = availableNodes;
        this.edgeInformations = new TSPEdgeMemory(availableNodes);
        this.initializeEdges();
    }

    protected initializeEdges() {
        this.edgeInformations.forEach((a, b) => {
            this.edgeInformations.set(a, b, {
                pheromone: this.prng.nextFloat(),
                heuristically: 1 / getDistance(a, b)
            });
        });
    }

    protected calculateProbability(ei: EdgeInformation) {
        return Math.pow(ei.pheromone, this.alpha) * Math.pow(ei.heuristically, this.beta);
    }

    protected calculateProbabilityForConnected(node: TSPNode, connected: Iterable<TSPNode> = this.edgeInformations.allConnectedNodes(node)): { other: TSPNode, probability: number }[] {
        const probabilityPairs: { other: TSPNode, probability: number }[] = new Array();

        let sum = 0;

        for (const other of connected) {
            const probability = this.calculateProbability(this.edgeInformations.get(node, other));

            probabilityPairs.push({ other, probability });
            sum += probability;
        }

        for (const pair of probabilityPairs)
            pair.probability /= sum;

        return probabilityPairs;
    }

    protected calculatePathForAnts(ants: number): TSPNode[][] {
        const paths = [];
        for (let i = 0; i < ants; i++) {
            const remainingNodes = this.availableNodes.slice(0);

            const path = remainingNodes.splice(i % remainingNodes.length, 1);

            for (let k = 1; k < this.availableNodes.length; k++) {
                const next = this.prng.nextFloat();

                let probSum = 0;
                let current = undefined;

                for (const pair of this.calculateProbabilityForConnected(path[k - 1], remainingNodes)) {
                    probSum += pair.probability;
                    current = pair.other;

                    if (probSum >= next)
                        break;
                }

                remainingNodes.splice(remainingNodes.indexOf(current), 1);
                path.push(current);
            }

            paths.push(path);
        }

        return paths;
    }



    protected calculateNewPheromoneForEdge(edge: Edge<EdgeInformation>, paths: TSPNode[][]) {
        let heuristicSum = 0;

        for (const path of paths)
            if (containsEdge(path, edge.a, edge.b))
                heuristicSum += 1 / getPathLength(path);

        return (1 - this.evaporationRate) * edge.edgeInformation.pheromone + this.evaporationRate * this.fitScale * heuristicSum;
    }

    protected updateEdgePheromone(edge: Edge<EdgeInformation>, paths: TSPNode[][]) {

        // this.edgeInformations.forEach((a, b, ei) => {
        //     ei.pheromone = this.calculateNewPheromoneAllContaining(ei.pheromone, paths.filter(p => containsEdge(p, a, b)))
        // })
    }

    protected step(): TSPNode[] {
        const paths = this.calculatePathForAnts(this.availableNodes.length);

        this.updatePheromonePheromone

        return getBest(paths, getPathLength, (a, b) => a < b);
    }

    protected isFinished(): boolean {
        throw new Error("Method not implemented.");
    }
}