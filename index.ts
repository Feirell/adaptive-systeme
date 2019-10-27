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

const createTimeout = (ms: number) => new Promise((res, rej) => setTimeout(res, ms));

document.addEventListener('DOMContentLoaded', async () => {
  const svg = document.getElementsByTagName('svg')[0];

  const renderer = new Renderer(svg);

  const width = 400;
  const height = 400;

  svg.setAttribute('width', width + 'px');
  svg.setAttribute('height', height + 'px');

  const tsp = createTSPWithRandomPoints(10, width, height);

  const markA = 'before-brute';
  const markB = 'after-brute';

  performance.mark(markA);
  let bestRoute;
  // for (bestRoute of tsp.getBestRouteBruteForce()) {
  for (bestRoute of tsp.getHillClimbedRoute()) {
    renderer.render(bestRoute);
    console.count('render')
    await createTimeout(0);
  }
  performance.mark(markB);

  performance.measure('bruteforce', markA, markB);

  logPerformanceEntryByName("bruteforce");

  performance.clearMarks();
  performance.clearMeasures();
});