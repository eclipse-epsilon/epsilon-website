import { AvoidLib } from 'libavoid-js';
import libavoidWasm from 'libavoid.wasm';

const CORNER_RADIUS = 4;
const CLUSTER_PADDING = 12;
const SELF_LOOP_GAP = 16;
// libavoid connection pin class and visibility (ConnDirAll)
const PIN = 1;
const CONN_DIR_ALL = 15;

let avoidLoading = null;

function loadAvoid() {
    avoidLoading ??= AvoidLib.load(libavoidWasm).then(() => AvoidLib.getInstance());
    return avoidLoading;
}

/**
 * Makes the classes/objects (and packages/containers) of a PlantUML class
 * diagram SVG movable. When nodes are moved, the affected links are
 * rerouted orthogonally around the other nodes using libavoid, and their
 * decorations (arrowheads, diamonds) and labels are moved along with them.
 *
 * Expects the SVG structure produced by PlantUML, where nodes are
 * g.entity / g.cluster elements and links are g.link elements that
 * reference their ends through data-entity-1 and data-entity-2.
 */
class MovableDiagram {

    /**
     * Makes the nodes of an SVG diagram movable, once libavoid is loaded.
     *
     * @param svg the (already embedded) SVG element
     * @param layout the layout to restore and update as nodes are moved:
     *   offsets is a Map from node ids to {x, y} offsets, and routed is a Set
     *   with the indices of the links that have been rerouted
     */
    static async create(svg, layout = { offsets: new Map(), routed: new Set() }) {
        return new MovableDiagram(svg, layout, await loadAvoid());
    }

    constructor(svg, layout, avoid) {
        this.svg = svg;
        this.avoid = avoid;
        this.offsets = layout.offsets;
        this.routed = layout.routed;
        this.router = null;
        this.nodes = new Map();
        this.links = [];
        this.drag = null;

        if (!this.collectNodes()) return;
        this.collectLinks();
        this.createRouter();

        if (this.offsets.size > 0) {
            for (const node of this.nodes.values()) this.applyOffset(node);
            this.updateClusters();
            this.links.forEach((link, i) => { if (this.routed.has(i)) this.route(link); });
            this.reroute(new Set(this.offsets.keys()));
        }

        for (const node of this.nodes.values()) this.makeDraggable(node);
    }

    /** Releases the memory used by libavoid */
    destroy() {
        this.router?.delete();
        this.router = null;
    }

    createRouter() {
        const A = this.avoid;
        this.router = new A.Router(A.RouterFlag.OrthogonalRouting.value);
        this.router.setRoutingParameter(A.RoutingParameter.shapeBufferDistance, 12);
        this.router.setRoutingParameter(A.RoutingParameter.idealNudgingDistance, 12);
        this.router.setRoutingParameter(A.RoutingParameter.segmentPenalty, 50);
        this.router.setRoutingParameter(A.RoutingParameter.crossingPenalty, 200);
        this.router.setRoutingOption(A.RoutingOption.nudgeOrthogonalSegmentsConnectedToShapes, true);
        this.router.setRoutingOption(A.RoutingOption.nudgeSharedPathsWithCommonEndPoint, true);
        this.router.setRoutingOption(A.RoutingOption.performUnifyingNudgingPreprocessingStep, true);

        // Clusters are not obstacles: links can run through them to reach their nodes
        for (const node of this.nodes.values()) {
            if (node.cluster) continue;
            const r = node.rect;
            const topLeft = new A.Point(r.x, r.y), bottomRight = new A.Point(r.x + r.width, r.y + r.height);
            const rectangle = new A.Rectangle(topLeft, bottomRight);
            node.obstacle = new A.ShapeRef(this.router, rectangle);
            // Links attach to the centre and are spread out by libavoid's nudging
            new A.ShapeConnectionPin(node.obstacle, PIN, 0.5, 0.5, true, 0, CONN_DIR_ALL);
            node.obstacleOffset = { x: 0, y: 0 };
            topLeft.delete(); bottomRight.delete(); rectangle.delete();
        }
    }

    static isApplicable(svg) {
        return svg != null && svg.querySelector("g.entity[id], g.cluster[id]") != null;
    }

    collectNodes() {
        for (const element of this.svg.querySelectorAll("g.entity[id], g.cluster[id]")) {
            const shape = element.querySelector(":scope > rect, :scope > polygon, :scope > ellipse, :scope > circle, :scope > path");
            if (shape == null) continue;
            const box = shape.getBBox();
            // getBBox() returns an empty box if the SVG is not displayed
            if (box.width == 0 && box.height == 0) return false;
            const title = element.querySelector(":scope > text");
            this.nodes.set(element.id, {
                id: element.id,
                element,
                shape,
                name: element.getAttribute("data-qualified-name") ?? element.id,
                cluster: element.classList.contains("cluster"),
                baseRect: { x: box.x, y: box.y, width: box.width, height: box.height },
                rect: { x: box.x, y: box.y, width: box.width, height: box.height },
                title: title ? { element: title, x: parseFloat(title.getAttribute("x")), y: parseFloat(title.getAttribute("y")) } : null,
                children: []
            });
        }

        // Nodes nested in clusters have qualified names prefixed by the cluster's
        for (const cluster of this.nodes.values()) {
            if (!cluster.cluster) continue;
            for (const node of this.nodes.values()) {
                if (node != cluster && node.name.startsWith(cluster.name + ".")) {
                    cluster.children.push(node);
                }
            }
        }
        return this.nodes.size > 0;
    }

    collectLinks() {
        for (const element of this.svg.querySelectorAll("g.link")) {
            const path = element.querySelector("path");
            let source = this.nodes.get(element.getAttribute("data-entity-1"));
            let target = this.nodes.get(element.getAttribute("data-entity-2"));
            if (path == null || source == null || target == null) continue;

            const polyline = this.samplePath(path);
            if (polyline.length < 2) continue;
            const start = polyline[0], end = polyline[polyline.length - 1];

            // Make sure that the link's source is the node at the start of its path
            if (distanceToRect(start, source.rect) + distanceToRect(end, target.rect) >
                distanceToRect(start, target.rect) + distanceToRect(end, source.rect)) {
                [source, target] = [target, source];
            }

            const link = { element, path, source, target, polyline, routed: false, decorations: [], labels: [] };

            for (const polygon of element.querySelectorAll("polygon")) {
                const points = parsePoints(polygon.getAttribute("points"));
                const centroid = average(points);
                const atStart = distance(centroid, start) < distance(centroid, end);
                link.decorations.push(this.createDecoration(polygon, points, atStart ? start : end,
                    atStart ? polyline[1] : polyline[polyline.length - 2], atStart));
            }

            for (const text of element.querySelectorAll("text")) {
                const box = text.getBBox();
                link.labels.push({
                    element: text,
                    width: box.width,
                    height: box.height,
                    // Offsets from the bounding box to the text's x/y attributes
                    dx: parseFloat(text.getAttribute("x")) - box.x,
                    dy: parseFloat(text.getAttribute("y")) - box.y
                });
            }

            this.links.push(link);
        }
    }

    samplePath(path) {
        const length = path.getTotalLength();
        const count = Math.max(8, Math.ceil(length / 10));
        const points = [];
        for (let i = 0; i <= count; i++) {
            const p = path.getPointAtLength(length * i / count);
            points.push({ x: p.x, y: p.y });
        }
        return points;
    }

    /**
     * Captures the geometry of a decoration in a frame anchored at its tip
     * (the point touching the node), so it can be re-applied to a new end.
     */
    createDecoration(polygon, points, pathEnd, previous, atStart) {
        let tip = points[0];
        for (const p of points) if (distance(p, pathEnd) > distance(tip, pathEnd)) tip = p;
        let u = normalise({ x: tip.x - pathEnd.x, y: tip.y - pathEnd.y });
        if (u == null) u = normalise({ x: pathEnd.x - previous.x, y: pathEnd.y - previous.y }) ?? { x: 1, y: 0 };
        const n = { x: -u.y, y: u.x };
        const local = p => ({ a: (p.x - tip.x) * u.x + (p.y - tip.y) * u.y, b: (p.x - tip.x) * n.x + (p.y - tip.y) * n.y });
        return { polygon, atStart, points: points.map(local), pathEnd: local(pathEnd).a };
    }

    makeDraggable(node) {
        const element = node.element;
        element.classList.add("movable");
        // Keep svg-pan-zoom from panning when a node is grabbed
        const stop = event => event.stopPropagation();
        element.addEventListener("mousedown", stop);
        element.addEventListener("touchstart", stop, { passive: true });

        element.addEventListener("pointerdown", event => {
            if (event.button != 0 || this.drag != null) return;
            // Nested nodes receive the event first
            event.stopPropagation();
            event.preventDefault();

            const moved = [node, ...node.children];
            this.drag = {
                pointerId: event.pointerId,
                start: this.toDiagram(event),
                moved,
                initial: new Map(moved.map(n => [n.id, { ...this.offsetOf(n) }])),
                frame: null,
                last: null,
                dragged: false
            };
            this.svg.classList.add("dragging");

            const move = e => {
                if (e.pointerId != this.drag.pointerId) return;
                this.drag.last = e;
                if (this.drag.frame == null) {
                    this.drag.frame = requestAnimationFrame(() => {
                        this.drag.frame = null;
                        this.dragTo(this.drag.last);
                    });
                }
            };
            const up = e => {
                if (e.pointerId != this.drag.pointerId) return;
                window.removeEventListener("pointermove", move);
                window.removeEventListener("pointerup", up);
                window.removeEventListener("pointercancel", up);
                if (this.drag.frame != null) cancelAnimationFrame(this.drag.frame);
                this.dragTo(e);
                this.svg.classList.remove("dragging");
                this.drag = null;
            };
            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", up);
            window.addEventListener("pointercancel", up);
        });
    }

    toDiagram(event) {
        // Nodes and links share the coordinate system of their parent group
        const matrix = this.nodes.values().next().value.element.parentNode.getScreenCTM().inverse();
        return new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix);
    }

    dragTo(event) {
        const p = this.toDiagram(event);
        const dx = p.x - this.drag.start.x, dy = p.y - this.drag.start.y;
        // A click without any movement leaves the diagram untouched
        if (dx == 0 && dy == 0 && !this.drag.dragged) return;
        this.drag.dragged = true;
        for (const node of this.drag.moved) {
            const initial = this.drag.initial.get(node.id);
            this.offsets.set(node.id, { x: initial.x + dx, y: initial.y + dy });
            this.applyOffset(node);
        }
        this.updateClusters();
        this.reroute(new Set(this.drag.moved.map(n => n.id)));
    }

    offsetOf(node) {
        return this.offsets.get(node.id) ?? { x: 0, y: 0 };
    }

    applyOffset(node) {
        const offset = this.offsetOf(node);
        if (this.offsets.has(node.id)) node.element.setAttribute("transform", `translate(${offset.x},${offset.y})`);
        node.rect = { ...node.baseRect, x: node.baseRect.x + offset.x, y: node.baseRect.y + offset.y };
        if (node.obstacle) {
            this.router.moveShape_delta(node.obstacle, offset.x - node.obstacleOffset.x, offset.y - node.obstacleOffset.y);
            node.obstacleOffset = { ...offset };
        }
    }

    /** Grows clusters (innermost first) so that they keep containing their nodes */
    updateClusters() {
        const clusters = [...this.nodes.values()].filter(n => n.cluster)
            .sort((a, b) => b.name.split(".").length - a.name.split(".").length);
        for (const cluster of clusters) {
            const offset = this.offsetOf(cluster);
            let rect = { ...cluster.baseRect, x: cluster.baseRect.x + offset.x, y: cluster.baseRect.y + offset.y };
            for (const child of cluster.children) {
                rect = union(rect, inflate(child.rect, CLUSTER_PADDING));
            }
            cluster.rect = rect;
            if (cluster.shape.tagName == "rect") {
                cluster.shape.setAttribute("x", rect.x - offset.x);
                cluster.shape.setAttribute("y", rect.y - offset.y);
                cluster.shape.setAttribute("width", rect.width);
                cluster.shape.setAttribute("height", rect.height);
                if (cluster.title) {
                    // Keep the title centred at the top of the cluster
                    const base = cluster.baseRect;
                    cluster.title.element.setAttribute("x", round(cluster.title.x + (rect.x - offset.x + rect.width / 2) - (base.x + base.width / 2)));
                    cluster.title.element.setAttribute("y", round(cluster.title.y + (rect.y - offset.y) - base.y));
                }
            }
        }
    }

    /**
     * Starts routing (with libavoid) the links attached to the given nodes
     * (or to clusters whose bounds have changed) and the links that run
     * through them, and updates all the routed links.
     */
    reroute(movedIds) {
        const changed = new Set(movedIds);
        for (const node of this.nodes.values()) {
            if (node.cluster && (node.rect.width != node.baseRect.width || node.rect.height != node.baseRect.height)) changed.add(node.id);
        }
        const obstacles = [...changed].map(id => this.nodes.get(id)).filter(n => !n.cluster);

        for (const link of this.links) {
            if (link.routed) {
                // Links to clusters attach to their (possibly changed) centres
                if (link.connector && link.source.cluster) this.withConnEnd(link.source, end => link.connector.setSourceEndpoint(end));
                if (link.connector && link.target.cluster) this.withConnEnd(link.target, end => link.connector.setDestEndpoint(end));
            }
            else if (changed.has(link.source.id) || changed.has(link.target.id) || this.runsThrough(link, obstacles)) {
                this.route(link);
            }
        }

        this.router.processTransaction();
        for (const link of this.links) if (link.routed) this.applyRoute(link);
    }

    route(link) {
        link.routed = true;
        this.routed.add(this.links.indexOf(link));
        // libavoid doesn't route self-loops
        if (link.source == link.target) return;
        this.withConnEnd(link.source, source => this.withConnEnd(link.target, target => {
            link.connector = new this.avoid.ConnRef(this.router, source, target);
        }));
    }

    withConnEnd(node, fn) {
        let end, point = null;
        if (node.obstacle) {
            end = new this.avoid.ConnEnd(node.obstacle, PIN);
        }
        else {
            point = new this.avoid.Point(node.rect.x + node.rect.width / 2, node.rect.y + node.rect.height / 2);
            end = new this.avoid.ConnEnd(point);
        }
        fn(end);
        end.delete();
        point?.delete();
    }

    runsThrough(link, nodes) {
        return nodes.some(node => node != link.source && node != link.target &&
            link.polyline.some(p => p.x > node.rect.x && p.x < node.rect.x + node.rect.width &&
                p.y > node.rect.y && p.y < node.rect.y + node.rect.height));
    }

    applyRoute(link) {
        let points;
        if (link.connector) {
            const route = link.connector.displayRoute();
            points = [];
            for (let i = 0; i < route.size(); i++) {
                const p = route.at(i);
                points.push({ x: p.x, y: p.y });
            }
            route.delete();
            if (points.length < 2) return;
            // Routes connect the centres of the nodes: cut them at the nodes' outlines
            points = clipStart(this.straighten(points, link.source, link.target), this.outline(link.source));
            points = clipStart(points.reverse(), this.outline(link.target)).reverse();
        }
        else {
            points = this.selfLoop(link.source.rect);
        }
        const last = points.length - 1;
        link.polyline = points;

        // Decorations are anchored at the ports and the path is shortened accordingly
        const drawn = points.map(p => ({ ...p }));
        for (const decoration of link.decorations) {
            const end = decoration.atStart ? 0 : last;
            const tip = points[end];
            const previous = points[decoration.atStart ? 1 : last - 1];
            const u = normalise({ x: tip.x - previous.x, y: tip.y - previous.y }) ?? { x: 1, y: 0 };
            const n = { x: -u.y, y: u.x };
            const global = q => `${round(tip.x + q.a * u.x + q.b * n.x)},${round(tip.y + q.a * u.y + q.b * n.y)}`;
            decoration.polygon.setAttribute("points", decoration.points.map(global).join(","));
            // Don't shorten the end segment beyond its length
            const back = Math.min(-decoration.pathEnd, distance(tip, previous) - 1);
            drawn[end] = { x: tip.x - back * u.x, y: tip.y - back * u.y };
        }

        link.path.setAttribute("d", roundedPath(drawn));
        this.placeLabels(link, points);
    }

    /**
     * Removes the small jogs that libavoid's nudging introduces between
     * nodes that can be connected with a straight line.
     */
    straighten(points, source, target) {
        if (points.length != 4) return points;
        const [a, b, c, d] = points;
        const vertical = a.x == b.x && c.x == d.x && b.y == c.y;
        if (!vertical && !(a.y == b.y && c.y == d.y && b.x == c.x)) return points;
        const axis = vertical ? "x" : "y", size = vertical ? "width" : "height";
        if (Math.abs(b[axis] - c[axis]) > 20) return points;
        const lo = Math.max(source.rect[axis], target.rect[axis]) + 2;
        const hi = Math.min(source.rect[axis] + source.rect[size], target.rect[axis] + target.rect[size]) - 2;
        if (lo > hi) return points;
        const v = Math.min(hi, Math.max(lo, a[axis]));
        return [{ ...a, [axis]: v }, { ...d, [axis]: v }];
    }

    selfLoop(r) {
        const x = r.x + r.width * 0.75, y = r.y + r.height * 0.25;
        const right = r.x + r.width + SELF_LOOP_GAP, top = r.y - SELF_LOOP_GAP;
        return [{ x: r.x + r.width, y }, { x: right, y }, { x: right, y: top }, { x, y: top }, { x, y: r.y }];
    }

    /** The outline of a node as a polygon */
    outline(node) {
        const shape = node.shape, offset = this.offsetOf(node);
        if (shape.tagName == "polygon") {
            return parsePoints(shape.getAttribute("points")).map(p => ({ x: p.x + offset.x, y: p.y + offset.y }));
        }
        if (shape.tagName == "ellipse" || shape.tagName == "circle") {
            const cx = parseFloat(shape.getAttribute("cx")) + offset.x, cy = parseFloat(shape.getAttribute("cy")) + offset.y;
            const rx = parseFloat(shape.getAttribute(shape.tagName == "circle" ? "r" : "rx"));
            const ry = parseFloat(shape.getAttribute(shape.tagName == "circle" ? "r" : "ry"));
            return Array.from({ length: 32 }, (_, i) => ({ x: cx + rx * Math.cos(i * Math.PI / 16), y: cy + ry * Math.sin(i * Math.PI / 16) }));
        }
        const r = node.rect;
        return [{ x: r.x, y: r.y }, { x: r.x + r.width, y: r.y }, { x: r.x + r.width, y: r.y + r.height }, { x: r.x, y: r.y + r.height }];
    }

    /** Places labels next to the longest segments, avoiding nodes */
    placeLabels(link, points) {
        if (link.labels.length == 0) return;
        const segments = [];
        for (let i = 0; i < points.length - 1; i++) segments.push({ a: points[i], b: points[i + 1], length: distance(points[i], points[i + 1]) });
        segments.sort((s, t) => t.length - s.length);
        const obstacles = [...this.nodes.values()].filter(n => !n.cluster).map(n => n.rect);

        for (const label of link.labels) {
            const candidates = segments.flatMap(s => {
                const mid = { x: (s.a.x + s.b.x) / 2, y: (s.a.y + s.b.y) / 2 };
                return s.a.y == s.b.y ? [
                    { x: mid.x - label.width / 2, y: mid.y - 3 - label.height },
                    { x: mid.x - label.width / 2, y: mid.y + 3 }
                ] : [
                    { x: mid.x + 5, y: mid.y - label.height / 2 },
                    { x: mid.x - 5 - label.width, y: mid.y - label.height / 2 }
                ];
            }).map(c => ({ ...c, width: label.width, height: label.height }));
            const chosen = candidates.find(c => !obstacles.some(o => overlap(o, c))) ?? candidates[0];
            obstacles.push(chosen);
            label.element.setAttribute("x", round(chosen.x + label.dx));
            label.element.setAttribute("y", round(chosen.y + label.dy));
        }
    }
}

function roundedPath(points) {
    let d = `M${round(points[0].x)},${round(points[0].y)}`;
    for (let i = 1; i < points.length - 1; i++) {
        const p = points[i], before = points[i - 1], after = points[i + 1];
        const r = Math.min(CORNER_RADIUS, distance(before, p) / 2, distance(p, after) / 2);
        const u = normalise({ x: p.x - before.x, y: p.y - before.y }) ?? { x: 0, y: 0 };
        const v = normalise({ x: after.x - p.x, y: after.y - p.y }) ?? { x: 0, y: 0 };
        d += ` L${round(p.x - u.x * r)},${round(p.y - u.y * r)} Q${round(p.x)},${round(p.y)} ${round(p.x + v.x * r)},${round(p.y + v.y * r)}`;
    }
    const last = points[points.length - 1];
    return d + ` L${round(last.x)},${round(last.y)}`;
}

/** Cuts a polyline that starts inside a polygon where it leaves the polygon */
function clipStart(points, polygon) {
    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i], b = points[i + 1];
        let exit = null;
        for (let j = 0; j < polygon.length; j++) {
            const c = polygon[j], d = polygon[(j + 1) % polygon.length];
            const denominator = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
            if (denominator == 0) continue;
            const t = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / denominator;
            const u = ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) / denominator;
            if (t >= 0 && t <= 1 && u >= 0 && u <= 1 && (exit == null || t > exit)) exit = t;
        }
        if (exit != null) return [{ x: a.x + (b.x - a.x) * exit, y: a.y + (b.y - a.y) * exit }, ...points.slice(i + 1)];
    }
    return points;
}

function parsePoints(value) {
    const numbers = value.trim().split(/[\s,]+/).map(parseFloat);
    const points = [];
    for (let i = 0; i + 1 < numbers.length; i += 2) points.push({ x: numbers[i], y: numbers[i + 1] });
    return points;
}

function distanceToRect(p, r) {
    const dx = Math.max(r.x - p.x, 0, p.x - r.x - r.width);
    const dy = Math.max(r.y - p.y, 0, p.y - r.y - r.height);
    return Math.hypot(dx, dy);
}

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalise(v) {
    const length = Math.hypot(v.x, v.y);
    return length < 1e-6 ? null : { x: v.x / length, y: v.y / length };
}

function average(points) {
    return { x: points.reduce((s, p) => s + p.x, 0) / points.length, y: points.reduce((s, p) => s + p.y, 0) / points.length };
}

function inflate(r, d) {
    return { x: r.x - d, y: r.y - d, width: r.width + 2 * d, height: r.height + 2 * d };
}

function union(a, b) {
    const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
    return { x, y, width: Math.max(a.x + a.width, b.x + b.width) - x, height: Math.max(a.y + a.height, b.y + b.height) - y };
}

function overlap(a, b) {
    return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

function round(v) {
    return Math.round(v * 100) / 100;
}

export { MovableDiagram };
