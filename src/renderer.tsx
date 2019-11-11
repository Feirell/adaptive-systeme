import React from 'react'
import ReactDOM from 'react-dom'

import { TSPNode } from "./tsp-node";
import { Improvement, AlgorithmProgress } from './index';
import { getPathLength } from './helper';

function keyForNode(node: TSPNode) {
  return node.x + ':' + node.y;
}

function Node({ node }: { node: TSPNode }) {
  return <circle
    cx={node.x}
    cy={node.y}
    r="4"
  />
}

function keyForEdge(a: TSPNode, b: TSPNode) {
  if (nodeCompare(a, b))
    return keyForNode(a) + '-' + keyForNode(b);
  else
    return keyForNode(b) + '-' + keyForNode(a);
}

function Edge({ a, b }: { a: TSPNode, b: TSPNode }) {
  return <line
    x1={a.x}
    y1={a.y}

    x2={b.x}
    y2={b.y}

    stroke="black"
  />
}

const nodeCompare = (a: TSPNode, b: TSPNode) => {
  if (a.x < b.x)
    return 1;
  else if (a.x > b.x)
    return -1;

  if (a.y < b.y)
    return 1;
  else if (a.y > b.y)
    return -1;

  return 0;
}

function NodesRenderer({ nodes }: { nodes: TSPNode[] }) {
  return <>
    {nodes.slice(0).sort(nodeCompare).map(n => <Node
      key={n.x + ':' + n.y}
      node={n}
    />)}
  </>
}

function PathRenderer({ path }: { path: TSPNode[] }) {
  const pathElems = new Array(path.length + 1);
  let last = path[0];
  for (let i = 1; i <= path.length; i++) {
    const current = path[i == path.length ? 0 : i];

    pathElems[i] = <Edge
      key={keyForEdge(last, current)}
      a={last}
      b={current}
    />

    last = current;
  }

  return <>{pathElems}</>
}

const width = 400;
const height = 400;

const nrFormatter = (() => {
  const frm = Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return frm.format;
})()

function Improvement({ improvement }: { improvement: Improvement }) {
  return <div className="improvement">
    <div className="length">{nrFormatter(getPathLength(improvement.path))}</div>
    <div className="path">{improvement.path.map((n, i) => <span key={i}>{n.name}</span>)}</div>
  </div>
}

function ImplementationDisplay({ availableNodes, algorithm }: { availableNodes: TSPNode[], algorithm: AlgorithmProgress }) {
  const lastImprovement = algorithm.steps.get(algorithm.steps.length - 1);

  const finished = algorithm.finishTime != undefined;
  const finishedClass = finished ? ' finished' : '';
  const viewBoxPadding = 10;
  return <div className={"implementation-display" + finishedClass}>
    <svg shapeRendering="geometricPrecision"
      width={width + 2 * viewBoxPadding}
      height={height + 2 * viewBoxPadding}
      viewBox={[
        -viewBoxPadding,
        -viewBoxPadding,
        width + 2 * viewBoxPadding,
        height + 2 * viewBoxPadding
      ].join(' ')}>

      <NodesRenderer nodes={availableNodes} />
      <PathRenderer path={lastImprovement.path} />
    </svg>
    <div className="sidebar">
      <div className="meta">
        <div className="algorithm-name">{algorithm.name}</div>
        <div><span>Fertig:</span><span>{finished ? 'ja' : 'nein'}</span></div>
      </div>
      <div className="improvement-timeline">
        {[...algorithm.steps].map((p) => <Improvement key={p.index} improvement={p} />)}
      </div>
    </div>
  </div>
}

function createScrollSavePoint(match: string) {
  const getElements = () => Array.from(document.querySelectorAll(match));
  const wasScrolled = new Map(getElements().map(e => [e, e.scrollHeight - e.scrollTop <= e.clientHeight]));

  return function () {
    for (const elem of getElements())
      if (wasScrolled.get(elem))
        elem.scrollTop = elem.scrollHeight - elem.clientHeight;
  }
}

export function render(root: HTMLElement, availableNodes: TSPNode[], algorithms: AlgorithmProgress[]) {
  const reapplyScroll = createScrollSavePoint('.improvement-timeline');

  ReactDOM.render(<>
    {algorithms.map((a, i) => <ImplementationDisplay key={i} availableNodes={availableNodes} algorithm={a} />)}
  </>, root, () => {
    reapplyScroll();
  });
}