import { Renderer } from './renderer.js';
import { TSPMap } from './tsp-map.js';
import { TSPNode } from './tsp-node.js';
import { randomInt } from './random-int.js';
import { logPerformanceEntryByName } from './performance-logger.js';

function createTSPWithRandomPoints(countNodes: number, width: number, height: number) {
  const nodes = [];
  for (let i = 0; i < countNodes; i++)
    nodes.push(new TSPNode("Node#" + i, randomInt(0, width), randomInt(0, height)));

  return new TSPMap(nodes);
}

document.addEventListener('DOMContentLoaded', () => {
  const svg = document.getElementsByTagName('svg')[0];

  const renderer = new Renderer(svg);

  const width = 400;
  const height = 400;

  svg.setAttribute('width', width + 'px');
  svg.setAttribute('height', height + 'px');

  const tsp = createTSPWithRandomPoints(10, width, height);

  const markA = 'before-brute';
  const markB = 'after-brute';
  const markC = 'after-render'

  performance.mark(markA);
  const bestRoute = tsp.getBestRouteBruteForce();
  performance.mark(markB);
  renderer.render(bestRoute);
  performance.mark(markC);

  performance.measure('bruteforce', markA, markB);
  performance.measure('render', markB, markC);

  logPerformanceEntryByName("bruteforce");
  logPerformanceEntryByName("render");

  // Finally, clean up the entries.
  performance.clearMarks();
  performance.clearMeasures();
});