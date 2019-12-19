import React from 'react';
import ReactDOM, { render } from 'react-dom';

export type ErrorResult = boolean[][];
export type WeightDefinition = number[][][];

const getBiggestLayer = (net: WeightDefinition) => {
  let max = net[0][0].length;

  for (let i = 0; i < net.length; i++) {
    const layer = net[i];
    const layerWidth = layer.length;
    if (layerWidth > max)
      max = layerWidth;
  }

  return max;
}

function TestResult({ trainingErrorResult, columns = 15 }: { trainingErrorResult: ErrorResult, columns?: number }) {
  return <div
    className="results"
    style={{
      gridTemplateColumns: "repeat(" + columns + ", 1fr)"
    }}
  >
    {trainingErrorResult.map((v, i) => <div key={i} className={v.some(v => !v) ? 'wrong' : 'correct'}></div>)}
  </div>
}

function Net({ net }: { net: WeightDefinition }) {
  if (net.length < 1)
    return <span>Can not render net with one or none layer</span>

  const nodeDiameter = 10;
  const nodeMargin = 5;
  const layerMargin = 20;

  const biggestLayer = getBiggestLayer(net);

  const layerWidth = (layer: number) => {
    if (layer == 0)
      return net[0][0].length;
    else
      return net[layer - 1].length;
  }

  const getNodeCenter = (layer: number, node: number, layerSize = layerWidth(layer)) => {
    const biggestWidth = biggestLayer * (nodeMargin + nodeDiameter) - nodeMargin;
    const currentWidth = layerSize * (nodeMargin + nodeDiameter) - nodeMargin;

    const offset = (biggestWidth - currentWidth) / 2;

    const cx = (nodeDiameter + layerMargin) * layer + nodeDiameter / 2;
    const cy = (nodeDiameter + nodeMargin) * node + nodeDiameter / 2 + offset;

    return { cy, cx };
  }

  const ret = [];

  for (let layer = 0; layer < net.length + 1; layer++) {
    const width = layerWidth(layer);
    for (let node = 0; node < width; node++) {
      const center = getNodeCenter(layer, node, width);

      const customData = { 'data-layer': layer, 'data-node': node };
      ret.push(<circle key={layer + '-' + node} cx={center.cx} cy={center.cy} r={nodeDiameter / 2} {...customData} />);
    }
  }
  // for (let i = 0)
  return <svg className="net">{ret}</svg>
}

export function renderNeuronalNet({ root, net, trainingErrorResult, continueClick }: { root: HTMLElement, net: WeightDefinition, trainingErrorResult: ErrorResult, continueClick: () => void }) {
  ReactDOM.render(<div className="neuronal-net-display">
    <TestResult trainingErrorResult={trainingErrorResult} />
    <Net net={net} />
    <div className="control">
      <button className="continue" onClick={continueClick}>fort­set­zen</button>
    </div>
  </div>, root);
}