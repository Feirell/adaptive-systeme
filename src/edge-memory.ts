import { TSPNode } from "./tsp-node";
import { IteratorAndIterable, produceIteratorAndIterable, extendIterable } from "./iterator-helper";

const sum = (n: number) => n * (n + 1) * 0.5;

type IterationReturnValue<T> = [{ row: number, column: number }, T];

class HalfMatrix<T, D = null> implements Iterable<IterationReturnValue<T>>{
    private readonly memory = new Array(sum(this.dimension - 1)) as T[];
    constructor(public readonly dimension: number, private readonly diagonalValue: D = null, initializingValue: T = undefined) {
        this.memory.fill(initializingValue);
    }

    protected ensureCoordinate(coord: number, name: 'column' | 'row'): never | void {
        if (!Number.isInteger(coord))
            throw new TypeError(name + ' needs to an integer');

        if (coord < 0)
            throw new RangeError(name + ' needs to be equal or greater than 0');

        if (coord >= this.dimension)
            throw new RangeError(name + ' needs to be less than ' + (this.dimension - 1));
    }

    protected transformRCToIndex(column: number, row: number): number {
        this.ensureCoordinate(row, 'row');
        this.ensureCoordinate(column, 'column');

        const c = row < column ? row : column;
        const r = column > row ? column : row;

        if (r == c)
            return null;

        const ret = this.memory.length - sum(r) + c;

        return ret;
    }

    get(column: number, row: number) {
        const index = this.transformRCToIndex(column, row);
        if (index === null)
            return this.diagonalValue;

        return this.memory[index];
    }

    set(column: number, row: number, val: T) {
        const index = this.transformRCToIndex(column, row);
        if (index === null)
            throw new RangeError('tried to set the diagonal value');

        return this.memory[index] = val;
    }

    forEach(fnc: (column: number, row: number, value: T, instance: HalfMatrix<T, D>) => void, thisParam: any = null) {
        for (const ite of this)
            fnc.call(thisParam, ite[0].column, ite[0].row, ite[1], this);
    }

    /**
     * This is in the order of the following triangle, from left to right from top to bottom:
     * 
     *   A B C D
     * D 0 1 2
     * C 3 4
     * B 5
     * A
     * 
     */
    [Symbol.iterator]() {
        let column = 0;
        let row = this.dimension - 1;

        return produceIteratorAndIterable<IterationReturnValue<T>>(() => {
            const done = row <= 0;

            const ret = { done, value: done ? undefined as any : [{ row, column }, this.get(column, row)] as IterationReturnValue<T> }

            if (!done) {
                column++;
                if (column >= row) {
                    row--;
                    column = 0;
                }
            }

            return ret;
        });
    }
}

export interface Edge<T, N = TSPNode> {
    a: N;
    b: N;
    edgeInformation: T;
}

export class TSPEdgeMemory<T> implements Iterable<Edge<T>> {
    private readonly backing: HalfMatrix<T>;
    private readonly nodeMap: Map<TSPNode, number> = new Map();

    constructor(nodes: TSPNode[]) {
        this.backing = new HalfMatrix(nodes.length);

        let i = 0;
        for (const node of nodes)
            this.nodeMap.set(node, i++);
    }

    getNodeForId(id: number) {
        for (const pair of this.nodeMap)
            if (pair[1] == id)
                return pair[0];

        throw new RangeError('the id ' + id + ' is not used');
    }

    getIdForNode(node: TSPNode) {
        if (!this.nodeMap.has(node))
            throw new RangeError('the node ' + node + ' is not registered with this TSPEdgeMemory');

        return this.nodeMap.get(node);
    }

    get(a: TSPNode, b: TSPNode) {
        return this.backing.get(
            this.getIdForNode(a),
            this.getIdForNode(b)
        );
    }

    set(a: TSPNode, b: TSPNode, val: T) {
        return this.backing.set(
            this.getIdForNode(a),
            this.getIdForNode(b),
            val
        );
    }

    forEach(fnc: (edge: Edge<T>, instance: TSPEdgeMemory<T>) => void, thisParam: any = null) {
        for (const ite of this)
            fnc.call(thisParam, ite, this);
    }

    allConnectedNodes(to: TSPNode) {
        const toIndex = this.getIdForNode(to);
        const max = this.nodeMap.size;
        let index = 0;

        return produceIteratorAndIterable<TSPNode>(() => {
            // skip the to node
            if (index == toIndex)
                index++;

            const done = index >= max;

            return { done, value: done ? undefined : this.getNodeForId(index++) };
        });
    }

    allEdgesTo(to: TSPNode): IteratorAndIterable<Edge<T>> {
        return extendIterable(this.allConnectedNodes(to), (val: TSPNode) => ({
            a: to,
            b: val,
            edgeInformation: this.get(to, val)
        }));
    }

    [Symbol.iterator]() {
        const iterator = this.backing[Symbol.iterator]();
        return extendIterable(iterator, (val): Edge<T> => {
            return {
                a: this.getNodeForId(val[0].row),
                b: this.getNodeForId(val[0].column),
                edgeInformation: val[1]
            }
        });
    }
}