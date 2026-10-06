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
 * Link labels can also be moved by dragging them.
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
     *   with the indices of the links that have been rerouted, and labels is
     *   a Map from "link index:label index" keys to the anchors of the labels
     *   that have been moved by the user
     */
    static async create(svg, layout = { offsets: new Map(), routed: new Set(), labels: new Map() }) {
        return new MovableDiagram(svg, layout, await loadAvoid());
    }

    constructor(svg, layout, avoid) {
        this.svg = svg;
        this.avoid = avoid;
        this.offsets = layout.offsets;
        this.routed = layout.routed;
        this.anchors = layout.labels;
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
        // Routed links have placed their labels already
        for (const link of this.links) if (!link.routed) this.placeLabels(link, false);

        for (const node of this.nodes.values()) this.makeDraggable(node);
        for (const link of this.links) link.labels.forEach(label => this.makeLabelDraggable(link, label));
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
                const key = `${this.links.length}:${link.labels.length}`;
                link.labels.push({
                    element: text,
                    key,
                    // Top-left corner of the label
                    x: box.x,
                    y: box.y,
                    width: box.width,
                    height: box.height,
                    // Where a label moved by the user is attached to its link
                    anchor: this.anchors.get(key) ?? null,
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
        // The tip is the point furthest along the end of the path. The farthest point is not
        // always the tip: the wings of PlantUML's arrowheads are farther from the path end.
        const d = normalise({ x: pathEnd.x - previous.x, y: pathEnd.y - previous.y }) ?? { x: 1, y: 0 };
        const ahead = p => (p.x - pathEnd.x) * d.x + (p.y - pathEnd.y) * d.y;
        let tip = points[0];
        for (const p of points) if (ahead(p) > ahead(tip)) tip = p;
        const u = normalise({ x: tip.x - pathEnd.x, y: tip.y - pathEnd.y }) ?? d;
        const n = { x: -u.y, y: u.x };
        const local = p => ({ a: (p.x - tip.x) * u.x + (p.y - tip.y) * u.y, b: (p.x - tip.x) * n.x + (p.y - tip.y) * n.y });
        return { polygon, atStart, points: points.map(local), pathEnd: local(pathEnd).a };
    }

    makeDraggable(node) {
        this.onDrag(node.element, () => {
            const moved = [node, ...node.children];
            const initial = new Map(moved.map(n => [n.id, { ...this.offsetOf(n) }]));
            return (dx, dy) => {
                for (const n of moved) {
                    const start = initial.get(n.id);
                    this.offsets.set(n.id, { x: start.x + dx, y: start.y + dy });
                    this.applyOffset(n);
                }
                this.updateClusters();
                this.reroute(new Set(moved.map(n => n.id)));
            };
        });
    }

    makeLabelDraggable(link, label) {
        this.onDrag(label.element, () => {
            const initial = { x: label.x, y: label.y };
            return (dx, dy) => {
                moveLabel(label, initial.x + dx, initial.y + dy);
                label.anchor = anchorOf(link.polyline, label);
                this.anchors.set(label.key, label.anchor);
            };
        });
    }

    /**
     * Lets an element be dragged. When a drag starts, begin() is called and
     * returns the function that applies a displacement (dx, dy) from the start.
     */
    onDrag(element, begin) {
        element.classList.add("movable");
        // Keep svg-pan-zoom from panning when the element is grabbed
        const stop = event => event.stopPropagation();
        element.addEventListener("mousedown", stop);
        element.addEventListener("touchstart", stop, { passive: true });

        element.addEventListener("pointerdown", event => {
            if (event.button != 0 || this.drag != null) return;
            // Nested elements receive the event first
            event.stopPropagation();
            event.preventDefault();

            this.drag = {
                pointerId: event.pointerId,
                start: this.toDiagram(event),
                apply: begin(),
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
        this.drag.apply(dx, dy);
    }

    offsetOf(node) {
        return this.offsets.get(node.id) ?? { x: 0, y: 0 };
    }

    applyOffset(node) {
        const offset = this.offsetOf(node);
        if (this.offsets.has(node.id)) node.element.setAttribute("transform", `translate(${round(offset.x)},${round(offset.y)})`);
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
                cluster.shape.setAttribute("x", round(rect.x - offset.x));
                cluster.shape.setAttribute("y", round(rect.y - offset.y));
                cluster.shape.setAttribute("width", round(rect.width));
                cluster.shape.setAttribute("height", round(rect.height));
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
            // Routes connect the centres of the nodes: cut them at the nodes' outlines.
            // When the nodes overlap, a straight line may lie entirely inside them,
            // while libavoid's route may still leave the source outside the target.
            const source = this.outline(link.source), target = this.outline(link.target);
            const straight = this.straightLine(link);
            points = (straight && clipLink(straight, source, target)) ??
                clipLink(this.straighten(points, link.source, link.target), source, target);
            // Nothing can be drawn between nodes that overlap too much
            link.element.style.visibility = points ? "" : "hidden";
            if (points == null) return;
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
        this.placeLabels(link);
    }

    /**
     * Returns a straight (possibly diagonal) line between the centres of the
     * ends of a link, or null if it would cross any other non-container node.
     */
    straightLine(link) {
        const a = centre(link.source.rect), b = centre(link.target.rect);
        for (const node of this.nodes.values()) {
            if (node.cluster || node == link.source || node == link.target) continue;
            if (segmentCrossesRect(a, b, node.rect)) return null;
        }
        return [a, b];
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

    /**
     * Keeps the labels moved by the user at their anchors on the link, and
     * (if automatic is true) places the rest next to the longest segments,
     * avoiding nodes and the labels already in place.
     */
    placeLabels(link, automatic = true) {
        const points = link.polyline;
        for (const label of link.labels) {
            if (label.anchor) {
                const p = pointAtAnchor(points, label.anchor);
                moveLabel(label, p.x + label.anchor.dx, p.y + label.anchor.dy);
            }
        }
        const pending = link.labels.filter(label => !label.anchor);
        if (!automatic || pending.length == 0) return;
        const segments = [];
        for (let i = 0; i < points.length - 1; i++) segments.push({ a: points[i], b: points[i + 1], length: distance(points[i], points[i + 1]) });
        segments.sort((s, t) => t.length - s.length);
        const obstacles = [...this.nodes.values()].filter(n => !n.cluster).map(n => n.rect);
        for (const other of this.links) {
            if (other.element.style.visibility == "hidden") continue;
            for (const label of other.labels) {
                if (!pending.includes(label)) obstacles.push(label);
            }
        }

        for (const label of pending) {
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
            moveLabel(label, chosen.x, chosen.y);
        }
    }
}

/** Moves the top-left corner of a label */
function moveLabel(label, x, y) {
    label.x = x;
    label.y = y;
    label.element.setAttribute("x", round(x + label.dx));
    label.element.setAttribute("y", round(y + label.dy));
}

/**
 * Attaches a label to the point of a link nearest to it. Labels near an end
 * of the link keep their distance to that end, and the rest keep their
 * relative position along the link. The label keeps its offset from that point.
 */
function anchorOf(points, label) {
    const lengths = cumulativeLengths(points), total = lengths[lengths.length - 1];
    const s = nearestLength(points, lengths, { x: label.x + label.width / 2, y: label.y + label.height / 2 });
    const p = pointAtLength(points, lengths, s);
    const fraction = total > 0 ? s / total : 0.5;
    const anchor = { dx: label.x - p.x, dy: label.y - p.y };
    if (fraction < 0.25) anchor.fromStart = s;
    else if (fraction > 0.75) anchor.fromEnd = total - s;
    else anchor.fraction = fraction;
    return anchor;
}

function pointAtAnchor(points, anchor) {
    const lengths = cumulativeLengths(points), total = lengths[lengths.length - 1];
    const s = anchor.fraction != null ? anchor.fraction * total :
        anchor.fromStart != null ? anchor.fromStart : total - anchor.fromEnd;
    return pointAtLength(points, lengths, Math.min(total, Math.max(0, s)));
}

function cumulativeLengths(points) {
    const lengths = [0];
    for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + distance(points[i - 1], points[i]));
    return lengths;
}

function pointAtLength(points, lengths, s) {
    for (let i = 1; i < points.length; i++) {
        if (s <= lengths[i] || i == points.length - 1) {
            const segment = lengths[i] - lengths[i - 1];
            const t = segment > 0 ? Math.min(1, Math.max(0, (s - lengths[i - 1]) / segment)) : 0;
            return { x: points[i - 1].x + (points[i].x - points[i - 1].x) * t, y: points[i - 1].y + (points[i].y - points[i - 1].y) * t };
        }
    }
    return { ...points[0] };
}

/** The length along a polyline of its point nearest to p */
function nearestLength(points, lengths, p) {
    let best = 0, bestDistance = Infinity;
    for (let i = 1; i < points.length; i++) {
        const a = points[i - 1], b = points[i];
        const segment = lengths[i] - lengths[i - 1];
        const t = segment > 0 ? Math.min(1, Math.max(0, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (segment * segment))) : 0;
        const d = distance(p, { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
        if (d < bestDistance) { bestDistance = d; best = lengths[i - 1] + t * segment; }
    }
    return best;
}

/** The part of a polyline between a length a and a length b along it */
function subPolyline(points, lengths, a, b) {
    const result = [pointAtLength(points, lengths, a)];
    for (let i = 1; i < points.length - 1; i++) if (lengths[i] > a && lengths[i] < b) result.push(points[i]);
    result.push(pointAtLength(points, lengths, b));
    return result;
}

function centre(r) {
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
}

/** Whether the segment from a to b passes through the inside of a rectangle (Liang-Barsky clipping) */
function segmentCrossesRect(a, b, r) {
    const dx = b.x - a.x, dy = b.y - a.y;
    let t0 = 0, t1 = 1;
    for (const [p, q] of [[-dx, a.x - r.x], [dx, r.x + r.width - a.x], [-dy, a.y - r.y], [dy, r.y + r.height - a.y]]) {
        if (p == 0) {
            if (q <= 0) return false;
        }
        else {
            const t = q / p;
            if (p < 0) t0 = Math.max(t0, t);
            else t1 = Math.min(t1, t);
        }
    }
    return t0 < t1;
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

/**
 * Cuts a polyline that runs from inside a source polygon to inside a target
 * polygon, keeping the part between where it last leaves the source and where
 * it first enters the target. Returns null if there is no such part (i.e.
 * the polyline leaves the source after entering the target).
 */
function clipLink(points, source, target) {
    const lengths = cumulativeLengths(points), total = lengths[lengths.length - 1];
    let exit = 0, entry = total;
    for (let i = 0; i < points.length - 1; i++) {
        const segment = lengths[i + 1] - lengths[i];
        for (const t of crossings(points[i], points[i + 1], source)) exit = Math.max(exit, lengths[i] + t * segment);
        for (const t of crossings(points[i], points[i + 1], target)) entry = Math.min(entry, lengths[i] + t * segment);
    }
    if (entry - exit < 1) return null;
    return subPolyline(points, lengths, exit, entry);
}

/** The positions (between 0 and 1) where the segment from a to b crosses the outline of a polygon */
function crossings(a, b, polygon) {
    const result = [];
    for (let j = 0; j < polygon.length; j++) {
        const c = polygon[j], d = polygon[(j + 1) % polygon.length];
        const denominator = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
        if (denominator == 0) continue;
        const t = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / denominator;
        const u = ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) / denominator;
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) result.push(t);
    }
    return result;
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
