import React from 'react';
import ReactDOM, { render } from 'react-dom';

export type ErrorResult = boolean[][];

function TestResult({ errorResult, columns = 15 }: { errorResult: ErrorResult, columns?: number }) {
  return <div
    className="results"
    style={{
      gridTemplateColumns: "repeat(" + columns + ", 1fr)"
    }}
  >
    {errorResult.map((v, i) => <div key={i} className={v.some(v => !v) ? 'wrong' : 'correct'}></div>)}
  </div>
}

export function renderNeuronalNet({ root, net, errorResult, continueClick }: { root: HTMLElement, net: number[][][], errorResult: ErrorResult, continueClick: () => void }) {
  ReactDOM.render(<div className="neuronal-net-display">
    <TestResult errorResult={errorResult}></TestResult>
    <div className="control">
      <button className="continue" onClick={continueClick}>fort­set­zen</button>
    </div>
  </div>, root);
}