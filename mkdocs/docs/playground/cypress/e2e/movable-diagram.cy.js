import { playground, runButton, toggleModelDiagramButton, toggleMetamodelDiagramButton } from './constants.js';

// See SPECS.md for the requirements covered by these tests
const diagram = '#outputDiagram svg';
const fitButton = '[data-hint-text="Fit the diagram"]';

// A PlantUML diagram with nested packages, labelled links and a self-loop.
// Its files are served by Cypress, as the site does not publish cypress/fixtures.
const fixtureFolder = "cypress/fixtures/movable-diagram/";
const fixture = playground + "?movable&examples=" + new URL(fixtureFolder + "examples.json", playground).href;

// Matches on the pathname only, as the page URL also mentions the fixture in its query
function interceptFixture() {
    const pathname = file => new URL(fixtureFolder + file, playground).pathname;
    cy.intercept({ method: 'GET', pathname: pathname('examples.json') }, { fixture: 'movable-diagram/examples.json' });
    cy.intercept({ method: 'GET', pathname: pathname('diagram.egl') }, { fixture: 'movable-diagram/diagram.egl,utf8' });
}

function parsePoints(value) {
    const n = value.trim().split(/[\s,]+/).map(parseFloat), points = [];
    for (let i = 0; i + 1 < n.length; i += 2) points.push({ x: n[i], y: n[i + 1] });
    return points;
}

/** Selects a node of the diagram by its qualified name */
const node = name => svg => svg.querySelector(`[data-qualified-name="${name}"]`);

/** Selects a link label of the diagram by its text */
const label = text => svg => [...svg.querySelectorAll('g.link text')].find(t => t.textContent == text);

/** Selects the link between two nodes of the diagram, given their qualified names */
const link = (from, to) => svg => svg.querySelector(`g.link[data-entity-1="${node(from)(svg).id}"][data-entity-2="${node(to)(svg).id}"]`);

/** Runs a function with the output diagram (and the window), once it is movable */
function withDiagram(fn) {
    cy.get(`${diagram} .movable`).should('exist');
    cy.window().then(win => fn(win.document.querySelector(diagram), win));
}

/** The bounding box of a node, a label or a path in diagram coordinates, including its translation */
function box(element) {
    const shape = element.matches('g') ? element.querySelector(':scope > rect, :scope > polygon, :scope > ellipse, :scope > circle, :scope > path') : element;
    const b = shape.getBBox(), m = element.transform?.baseVal.consolidate()?.matrix;
    return { x: b.x + (m?.e ?? 0), y: b.y + (m?.f ?? 0), width: b.width, height: b.height };
}

const centre = b => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });

function inflate(b, d) {
    return { x: b.x - d, y: b.y - d, width: b.width + 2 * d, height: b.height + 2 * d };
}

function overlap(a, b) {
    return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

function expectContains(outer, inner, message) {
    const tolerance = 0.5;
    expect(inner.x, `${message} (left)`).to.be.at.least(outer.x - tolerance);
    expect(inner.y, `${message} (top)`).to.be.at.least(outer.y - tolerance);
    expect(inner.x + inner.width, `${message} (right)`).to.be.at.most(outer.x + outer.width + tolerance);
    expect(inner.y + inner.height, `${message} (bottom)`).to.be.at.most(outer.y + outer.height + tolerance);
}

/** The distance from a point to its nearest point along a path */
function distanceToPath(p, path) {
    const length = path.getTotalLength();
    let best = Infinity;
    for (let s = 0; s <= length; s += 0.5) {
        const q = path.getPointAtLength(s);
        best = Math.min(best, Math.hypot(p.x - q.x, p.y - q.y));
    }
    return best;
}

/**
 * Drags an element of the output diagram by (dx, dy) screen pixels.
 * The element is given as a function that selects it from the diagram SVG.
 */
function drag(select, dx, dy) {
    withDiagram((svg, win) => {
        const element = select(svg);
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
        element.dispatchEvent(new win.PointerEvent('pointerdown', { pointerId: 1, button: 0, isPrimary: true, clientX: x, clientY: y, bubbles: true, cancelable: true }));
        for (let i = 1; i <= 5; i++) {
            win.dispatchEvent(new win.PointerEvent('pointermove', { pointerId: 1, clientX: x + dx * i / 5, clientY: y + dy * i / 5, bubbles: true }));
        }
        win.dispatchEvent(new win.PointerEvent('pointerup', { pointerId: 1, clientX: x + dx, clientY: y + dy, bubbles: true }));
    });
}

/** Drags an element of the output diagram so that its centre lands on the centre of another one */
function dragOnto(select, target) {
    withDiagram(svg => {
        const a = select(svg).getBoundingClientRect(), b = target(svg).getBoundingClientRect();
        drag(select, (b.left + b.width / 2) - (a.left + a.width / 2), (b.top + b.height / 2) - (a.top + a.height / 2));
    });
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

describe('Tests moving nodes in the PlantUML output of the model2puml example', () => {
    beforeEach(() => {
      cy.visit(playground + "?model2puml");
    }),
    it('Checks that arrowheads follow the last segment of their links after moving nodes', () => {
      cy.get(runButton).click();
      cy.get('#outputDiagram svg g.entity.movable').should('have.length.greaterThan', 5);
      cy.document().then(doc => checkArrowheads(doc.querySelector('#outputDiagram svg'), 'before'));

      // Moving the first and the last nodes reroutes most links, in different directions
      drag(svg => svg.querySelector('g.entity'), 60, 50);
      drag(svg => [...svg.querySelectorAll('g.entity')].at(-1), -80, -40);
      cy.document().should(doc => expect(doc.querySelectorAll('#outputDiagram svg g.entity[transform]').length, 'moved nodes').to.be.greaterThan(0));
      cy.document().then(doc => checkArrowheads(doc.querySelector('#outputDiagram svg'), 'after'));
    })
  });

describe('Tests moving nodes, containers and labels in a PlantUML output', () => {
    beforeEach(() => {
      interceptFixture();
      cy.visit(fixture);
      cy.get(runButton).click();
    }),
    it('Checks that clicking a node without moving it leaves the diagram unchanged', () => {
      withDiagram(svg => {
        const before = svg.innerHTML;
        drag(node('D'), 0, 0);
        withDiagram(svg => expect(svg.innerHTML).to.equal(before));
      });
    }),
    it('Checks that dragged nodes follow the pointer at any zoom level without panning the diagram', () => {
      withDiagram((svg, win) => {
        const panZoom = win.outputPanel.diagramSvgPanZoomInstance;
        panZoom.zoom(2);
        const pan = panZoom.getPan(), before = node('E')(svg).getBoundingClientRect();
        drag(node('E'), 40, 30);
        withDiagram(svg => {
          const after = node('E')(svg).getBoundingClientRect();
          expect(after.left - before.left, 'horizontal displacement (px)').to.be.closeTo(40, 1);
          expect(after.top - before.top, 'vertical displacement (px)').to.be.closeTo(30, 1);
          expect(panZoom.getPan()).to.deep.equal(pan);
        });
      });
    }),
    it('Checks that moving a container moves its descendants, and only them', () => {
      drag(node('outer'), 50, 40);
      withDiagram(svg => {
        const translation = node('outer')(svg).getAttribute('transform');
        expect(translation).to.match(/^translate\(/);
        for (const name of ['outer.inner', 'outer.inner.A', 'outer.inner.B', 'outer.C']) {
          expect(node(name)(svg).getAttribute('transform'), name).to.equal(translation);
        }
        expect(node('D')(svg).hasAttribute('transform'), 'D is moved').to.be.false;
      });
    }),
    it('Checks that containers of any shape grow to enclose the nodes moved out of them, keeping their titles in place', () => {
      withDiagram(svg => {
        // The outer package has a left-aligned title, and the inner rectangle has a centred one
        const title = name => box(node(name)(svg).querySelector(':scope > text'));
        const titles = () => ({
          outer: title('outer').x - box(node('outer')(svg)).x,
          inner: centre(title('outer.inner')).x - centre(box(node('outer.inner')(svg))).x
        });
        const original = { inner: box(node('outer.inner')(svg)), outer: box(node('outer')(svg)), titles: titles() };
        drag(node('outer.inner.A'), -60, 120);
        withDiagram(() => {
          const a = box(node('outer.inner.A')(svg)), inner = box(node('outer.inner')(svg)), outer = box(node('outer')(svg));
          expect(node('outer.inner')(svg).hasAttribute('transform'), 'the container is moved').to.be.false;
          expectContains(inner, inflate(a, 12), 'inner encloses A with padding');
          expectContains(outer, inflate(inner, 12), 'outer encloses inner with padding');
          expectContains(inner, original.inner, 'inner does not shrink');
          expectContains(outer, original.outer, 'outer does not shrink');
          expect(titles().outer, 'outer title offset from the left').to.be.closeTo(original.titles.outer, 0.5);
          expect(titles().inner, 'inner title offset from the centre').to.be.closeTo(original.titles.inner, 0.5);
        });
      });
    }),
    it('Checks that links are drawn as straight lines between the outlines of their nodes when possible', () => {
      drag(node('E'), 100, 0);
      withDiagram(svg => {
        const path = link('D', 'E')(svg).querySelector('path');
        expect(path.getAttribute('d'), 'path').to.match(/^M[\d.,-]+ L[\d.,-]+$/);
        const start = path.getPointAtLength(0), d = box(node('D')(svg));
        const onOutline = Math.min(Math.abs(start.x - d.x), Math.abs(start.x - d.x - d.width), Math.abs(start.y - d.y), Math.abs(start.y - d.y - d.height));
        expect(onOutline, 'distance from the start of the link to the outline of D').to.be.lessThan(1);
        checkArrowheads(svg, 'after');
      });
    }),
    it('Checks that links between overlapping nodes are hidden until the nodes are moved apart', () => {
      dragOnto(node('E'), node('D'));
      withDiagram(svg => expect(link('D', 'E')(svg).style.visibility).to.equal('hidden'));
      drag(node('E'), 0, 150);
      withDiagram(svg => expect(link('D', 'E')(svg).style.visibility).to.equal(''));
    }),
    it('Checks that self-loops are drawn over the top-right corner of their node', () => {
      drag(node('D'), 80, 0);
      withDiagram(svg => {
        const d = box(node('D')(svg)), loop = box(link('D', 'D')(svg).querySelector('path'));
        expect(loop.x + loop.width, 'right of the loop').to.be.closeTo(d.x + d.width + 16, 1);
        expect(loop.y, 'top of the loop').to.be.closeTo(d.y - 16, 1);
      });
    }),
    it('Checks that labels placed automatically avoid nodes', () => {
      drag(node('outer.inner.B'), 120, 0);
      withDiagram(svg => {
        const nodes = [...svg.querySelectorAll('g.entity')].map(box);
        for (const text of ['ab', 'cd', 'loop']) {
          const b = box(label(text)(svg));
          expect(nodes.some(n => overlap(n, b)), `label ${text} overlaps a node`).to.be.false;
        }
      });
    }),
    it('Checks that dragged labels keep their position relative to their links when the links change', () => {
      withDiagram(svg => {
        const position = () => centre(box(label('cd')(svg)));
        const original = position();
        drag(label('cd'), 30, -20);
        withDiagram(() => {
          const dragged = position();
          expect(dragged.x, 'label moved by the user').to.not.be.closeTo(original.x, 1);
          const offset = distanceToPath(dragged, link('outer.C', 'D')(svg).querySelector('path'));
          drag(node('D'), 60, 80);
          withDiagram(() => {
            const moved = position();
            expect(moved.y, 'label moved with its link').to.be.greaterThan(dragged.y + 10);
            expect(distanceToPath(moved, link('outer.C', 'D')(svg).querySelector('path')), 'distance to its link').to.be.closeTo(offset, 2);
          });
        });
      });
    }),
    it('Checks that fitting the diagram keeps the layout, but running the program again resets it', () => {
      drag(node('outer.inner.A'), -300, 300);
      drag(label('cd'), 30, -20);
      withDiagram(svg => {
        const transform = node('outer.inner.A')(svg).getAttribute('transform'), labelX = label('cd')(svg).getAttribute('x');
        cy.get(fitButton).click();
        // Fitting replaces the SVG
        cy.get(diagram).should($svg => expect($svg[0]).to.not.equal(svg));
        withDiagram((fitted, win) => {
          expect(node('outer.inner.A')(fitted).getAttribute('transform')).to.equal(transform);
          expect(label('cd')(fitted).getAttribute('x')).to.equal(labelX);
          // The view is refitted to include the moved node, without zooming in
          expect(win.outputPanel.diagramSvgPanZoomInstance.getZoom()).to.be.at.most(1);
          const view = fitted.getBoundingClientRect(), a = node('outer.inner.A')(fitted).getBoundingClientRect();
          expectContains({ x: view.left, y: view.top, width: view.width, height: view.height }, { x: a.left, y: a.top, width: a.width, height: a.height }, 'moved node in view');

          cy.get(runButton).click();
          cy.get(`${diagram} [data-qualified-name="outer.inner.A"]`).should('not.have.attr', 'transform');
          withDiagram(run => expect(run.querySelectorAll('g.entity[transform], g.cluster[transform]')).to.have.length(0));
        });
      });
    })
  });

describe('Tests which diagrams can be moved', () => {
    it('Checks that the nodes of model and metamodel diagrams are movable', () => {
      cy.visit(playground + "?eol");
      cy.get(toggleModelDiagramButton).click();
      cy.get(toggleMetamodelDiagramButton).click();
      cy.get('#firstModelDiagram svg g.entity.movable').should('have.length.greaterThan', 0);
      cy.get('#firstMetamodelDiagram svg g.entity.movable').should('have.length.greaterThan', 0);
    }),
    it('Checks that Graphviz outputs are not movable', () => {
      cy.visit(playground + "?psl2graphviz");
      cy.get(runButton).click();
      cy.get('#outputDiagram svg g.node').should('have.length.greaterThan', 0);
      cy.get('#outputDiagram svg .movable').should('not.exist');
    })
  });
