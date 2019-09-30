import { TSPNode } from "./tsp-node.js";

export class Renderer {
  constructor(
    private svg: SVGSVGElement
  ) { }

  render(tspPath: TSPNode[], tspNonConnected: TSPNode[] = []) {
    // TODO reuse elements

    this.svg.innerHTML = '';

    for (let tspNode of tspNonConnected)
      this.svg.appendChild(this.renderNode(tspNode));

    let last = null;
    for (let tspNode of tspPath) {
      this.svg.appendChild(this.renderNode(tspNode));
      if (last)
        this.svg.appendChild(this.renderEdge(last, tspNode));
      last = tspNode;
    }

    if (last != null && last != tspPath[0])
      this.svg.appendChild(this.renderEdge(last, tspPath[0]));
  }

  renderNode(node: TSPNode, elem?: SVGCircleElement) {
    if (!elem)
      elem = document.createElementNS('http://www.w3.org/2000/svg', 'circle') as SVGCircleElement;

    elem.setAttribute('cx', '' + node.x);
    elem.setAttribute('cy', '' + node.y);
    elem.setAttribute('r', '4');

    return elem;
  }

  renderEdge(nodeA: TSPNode, nodeB: TSPNode, elem?: SVGLineElement) {
    if (!elem)
      elem = document.createElementNS('http://www.w3.org/2000/svg', 'line') as SVGLineElement;

    elem.setAttribute('x1', '' + nodeA.x);
    elem.setAttribute('y1', '' + nodeA.y);

    elem.setAttribute('x2', '' + nodeB.x);
    elem.setAttribute('y2', '' + nodeB.y);

    elem.setAttribute('stroke', 'black');
    return elem;
  }
}