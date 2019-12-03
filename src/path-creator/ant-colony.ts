import { getDistance, getBest, getPathLength, containsEdge } from '../helper';
import { PathCreator } from './path-creator';
import { TSPNode } from '../tsp-node';
import { TSPEdgeMemory, Edge } from '../edge-memory';

interface EdgeInformation {
    pheromone: number;
    heuristically: number;
}

export class AntColony extends PathCreator {
    public static readonly processorName = "ant colony";
    private readonly alpha = 1;
    private readonly beta = 1;
    private readonly evaporationRate = 0.4;
    private readonly fitScale = 0.2;

    private numberOfAnts: number;

    private edgeInformations: TSPEdgeMemory<EdgeInformation>;

    setAvailableNodes(availableNodes: TSPNode[]) {
        this.availableNodes = availableNodes;
        this.edgeInformations = new TSPEdgeMemory(availableNodes);
        this.numberOfAnts = availableNodes.length;
        this.initializeEdges();
    }

    protected initializeEdges() {
        this.edgeInformations.forEach((edge) => {
            this.edgeInformations.set(edge.a, edge.b, {
                pheromone: this.prng.nextFloat(),
                heuristically: 1 / getDistance(edge.a, edge.b)
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

    protected calculatePathWithAnt(startingWith: number | TSPNode) {
        const remainingNodes = this.availableNodes.slice(0);

        const startIndex = typeof startingWith == 'number' ?
            startingWith % remainingNodes.length :
            remainingNodes.indexOf(startingWith);

        if (startIndex < 0)
            throw new Error('starting node not found');

        const path = remainingNodes.splice(startIndex, 1);

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

        return path;
    }

    protected calculateNewPheromoneForEdge(edge: Edge<EdgeInformation>, paths: TSPNode[][]) {
        let heuristicSum = 0;

        for (const path of paths)
            if (containsEdge(path, edge.a, edge.b))
                heuristicSum += 1 / getPathLength(path);

        return (1 - this.evaporationRate) * edge.edgeInformation.pheromone + this.evaporationRate * this.fitScale * heuristicSum;
    }

    protected updateEdgePheromone(edge: Edge<EdgeInformation>, paths: TSPNode[][]) {
        edge.edgeInformation.pheromone = this.calculateNewPheromoneForEdge(edge, paths);
    }

    protected step(): TSPNode[] {
        const paths = new Array(this.numberOfAnts);

        for (let i = 0; i < this.numberOfAnts; i++)
            paths[i] = this.calculatePathWithAnt(i);

        for (const edge of this.edgeInformations)
            this.updateEdgePheromone(edge, paths);

        return getBest(paths, getPathLength, (a, b) => a < b);
    }

    protected isFinished(): boolean {
        return false;
    }
}