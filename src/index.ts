
// const c = (function* () {
//   yield 1;
//   yield 2;
//   yield 3;
// })();

// const c: Generator<number> & { count: number } = {
//   count: 0,
//   next(...args: any) {
//     console.log('next was called with', [...arguments]);
//     return {
//       value: this.count++,
//       done: false
//     }
//   },
//   return(value: number) {
//     console.log('return was called with', [...arguments]);
//     return {
//       done: false,
//       value: -1
//     };
//   },
//   throw(ex: any) {
//     console.log('throw was called with', [...arguments]);
//     return {
//       done: false,
//       value: (undefined) as any as number
//     }
//   },
//   [Symbol.iterator]() { return this; }
// }

// for (const elem of c) {
//   console.log('elem', elem);
//   break;
// }

// for (const elem of c) {
//   console.log('elem', elem);
//   break;
// }

// for (const elem of c) {
//   console.log('elem', elem);
//   break;
// }

// c.return();

// import { BruteForce } from './path-creator/brute-force';
// import { HillClimbing } from './path-creator/hill-climbing';
// import { Renderer } from './renderer';
// import { PRNG } from './path-creator/prng';
// import { TSPNode } from './tsp-node';
// import { getPathLength } from './helper';

// function createTSPWithRandomPoints(countNodes: number, width: number, height: number, prng?: PRNG) {
//   if (!prng)
//     prng = new PRNG(0x124432);

//   const nodes = [];
//   for (let i = 0; i < countNodes; i++)
//     nodes.push(new TSPNode("Node#" + i, prng.randomInteger(0, width), prng.randomInteger(0, height)));

//   return nodes;
// }

// const createTimeout = (ms: number) => new Promise((res, rej) => setTimeout(res, ms));

// const waitForFrame = () => new Promise(res => requestAnimationFrame(res));

// document.addEventListener('DOMContentLoaded', async () => {
//   const svg = document.getElementsByTagName('svg')[0];

//   const renderer = new Renderer(svg);

//   const width = 400;
//   const height = 400;

//   svg.setAttribute('width', width + 'px');
//   svg.setAttribute('height', height + 'px');

//   const tsp = createTSPWithRandomPoints(10, width, height);

//   let bestRoute;
//   // for (bestRoute of tsp.getBestRouteBruteForce()) {
//   const processor = new HillClimbing(tsp, 1000);
//   // const processor = new BruteForce(tsp, 5000);
//   let pathImprovements = 0;
//   for (bestRoute of processor) {
//     renderer.render(bestRoute);
//     pathImprovements++;
//     console.log('found better route:', getPathLength(bestRoute));
//     await createTimeout(250);
//     // await waitForFrame();
//   }

//   console.log(getPathLength(bestRoute));
//   console.log('had %d pathImprovements', pathImprovements);
// });