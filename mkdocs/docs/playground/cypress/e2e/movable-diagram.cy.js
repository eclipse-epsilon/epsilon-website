import { playground, runButton } from './constants.js';

function parsePoints(value) {
    const n = value.trim().split(/[\s,]+/).map(parseFloat), points = [];
    for (let i = 0; i + 1 < n.length; i += 2) points.push({ x: n[i], y: n[i + 1] });
    return points;
}

/**
 * Checks that the arrowhead of every visible link points along the last segment
 * of its path, and that the path ends at the arrowhead's notch. PlantUML draws
 * arrowheads as tip, wing, notch, wing, tip.
 */
function checkArrowheads(svg, label) {
    const angle = (a, b) => Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    let count = 0;
    for (const link of svg.querySelectorAll('g.link')) {
        const path = link.querySelector('path'), polygon = link.querySelector('polygon');
        if (link.style.visibility == 'hidden' || polygon == null) continue;
        const [tip, , notch] = parsePoints(polygon.getAttribute('points'));

        // The end of the path next to the arrowhead, and a point just before it
        const length = path.getTotalLength();
        let end = path.getPointAtLength(length), before = path.getPointAtLength(Math.max(0, length - 2));
        const start = path.getPointAtLength(0);
        if (Math.hypot(start.x - notch.x, start.y - notch.y) < Math.hypot(end.x - notch.x, end.y - notch.y)) {
            end = start;
            before = path.getPointAtLength(Math.min(length, 2));
        }

        const error = Math.abs(((angle(notch, tip) - angle(before, end)) + 540) % 360 - 180);
        expect(error, `${label} ${link.id}: angle between arrowhead and last segment (deg)`).to.be.lessThan(3);
        expect(Math.hypot(end.x - notch.x, end.y - notch.y), `${label} ${link.id}: distance from path end to arrowhead notch (px)`).to.be.lessThan(1.5);
        count++;
    }
    expect(count, `${label}: arrowheads`).to.be.greaterThan(0);
}

/** Drags a node of the output diagram by (dx, dy) screen pixels */
function dragNode(index, dx, dy) {
    cy.document().then(doc => {
        const win = doc.defaultView;
        const nodes = doc.querySelectorAll('#outputDiagram svg g.entity');
        const node = nodes[index < 0 ? nodes.length + index : index];
        const box = node.getBoundingClientRect();
        const x = box.left + box.width / 2, y = box.top + box.height / 2;
        node.dispatchEvent(new win.PointerEvent('pointerdown', { pointerId: 1, button: 0, isPrimary: true, clientX: x, clientY: y, bubbles: true, cancelable: true }));
        for (let i = 1; i <= 5; i++) {
            win.dispatchEvent(new win.PointerEvent('pointermove', { pointerId: 1, clientX: x + dx * i / 5, clientY: y + dy * i / 5, bubbles: true }));
        }
        win.dispatchEvent(new win.PointerEvent('pointerup', { pointerId: 1, clientX: x + dx, clientY: y + dy, bubbles: true }));
    });
}

describe('Tests moving nodes in the PlantUML output of the model2puml example', () => {
    beforeEach(() => {
      cy.visit(playground + "?model2puml");
    }),
    it('Checks that arrowheads follow the last segment of their links after moving nodes', () => {
      cy.get(runButton).click();
      cy.get('#outputDiagram svg g.entity.movable').should('have.length.greaterThan', 5);
      cy.document().then(doc => checkArrowheads(doc.querySelector('#outputDiagram svg'), 'before'));

      // Moving the first and the last nodes reroutes most links, in different directions
      dragNode(0, 60, 50);
      dragNode(-1, -80, -40);
      cy.document().should(doc => expect(doc.querySelectorAll('#outputDiagram svg g.entity[transform]').length, 'moved nodes').to.be.greaterThan(0));
      cy.document().then(doc => checkArrowheads(doc.querySelector('#outputDiagram svg'), 'after'));
    })
  });
