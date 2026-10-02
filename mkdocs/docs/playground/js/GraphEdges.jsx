import { EdgeLabelRenderer, useInternalNode } from '@xyflow/react';

/**
 * React components for the edges of the JSON graphs returned by the backend.
 */

var DEFAULT_EDGE_COLOR = "#7A7A7A";

var DECORATIONS = ["arrow", "arrow.empty", "diamond", "diamond.empty"];

function getEdgeColor(edge) {
    return edge.style?.color || DEFAULT_EDGE_COLOR;
}

function getMarkerId(prefix, decoration, color) {
    return prefix + "-" + decoration.replace(".", "-") + "-" + color.replace(/[^a-zA-Z0-9]/g, "");
}

function getMarkerUrl(prefix, edge, decoration) {
    if (!DECORATIONS.includes(decoration)) return undefined;
    return "url(#" + getMarkerId(prefix, decoration, getEdgeColor(edge)) + ")";
}

/**
 * SVG markers for the decorations of the edges of a graph, one per
 * decoration and edge color. Markers point towards the end of the edge
 * and are reversed at its start.
 */
function EdgeMarkers({ prefix, edges }) {
    var markers = new Map();
    for (const edge of edges) {
        for (const decoration of [edge.sourceDecoration, edge.targetDecoration]) {
            if (DECORATIONS.includes(decoration)) {
                var color = getEdgeColor(edge);
                markers.set(getMarkerId(prefix, decoration, color), { decoration, color });
            }
        }
    }

    return (
        <svg className="graph-markers">
            <defs>
                {[...markers].map(([id, { decoration, color }]) => {
                    var empty = decoration.endsWith(".empty");
                    var diamond = decoration.startsWith("diamond");
                    return (
                        <marker key={id} id={id} markerWidth={diamond ? 18 : 12} markerHeight="12"
                            viewBox={diamond ? "0 0 18 12" : "0 0 12 12"} refX={diamond ? 17 : 11} refY="6"
                            orient="auto-start-reverse" markerUnits="userSpaceOnUse">
                            <path d={diamond ? "M 1 6 L 9 1 L 17 6 L 9 11 Z" : (empty ? "M 1 1 L 11 6 L 1 11 Z" : "M 1 1 L 11 6 L 1 11 L 4 6 Z")}
                                fill={empty ? "white" : color} stroke={color} strokeWidth="1" strokeLinejoin="round" />
                        </marker>
                    );
                })}
            </defs>
        </svg>
    );
}

/**
 * Returns an SVG path through a sequence of points with rounded corners.
 */
function getPolylinePath(points, radius = 5) {
    var path = "M " + points[0].x + " " + points[0].y;
    for (var i = 1; i < points.length - 1; i++) {
        var previous = points[i - 1], current = points[i], next = points[i + 1];
        var r = Math.min(radius, distance(previous, current) / 2, distance(current, next) / 2);
        var before = moveTowards(current, previous, r);
        var after = moveTowards(current, next, r);
        path += " L " + before.x + " " + before.y + " Q " + current.x + " " + current.y + " " + after.x + " " + after.y;
    }
    var last = points[points.length - 1];
    return path + " L " + last.x + " " + last.y;
}

function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

function moveTowards(from, to, length) {
    var d = distance(from, to);
    if (d == 0) return from;
    return { x: from.x + (to.x - from.x) * length / d, y: from.y + (to.y - from.y) * length / d };
}

/**
 * Returns the point in the middle of a sequence of points (by length).
 */
function getMidpoint(points) {
    var total = 0;
    for (var i = 1; i < points.length; i++) total += distance(points[i - 1], points[i]);
    var remaining = total / 2;
    for (var i = 1; i < points.length; i++) {
        var length = distance(points[i - 1], points[i]);
        if (remaining <= length) return moveTowards(points[i - 1], points[i], remaining);
        remaining -= length;
    }
    return points[points.length - 1];
}

function getBounds(internalNode) {
    var position = internalNode.internals.positionAbsolute;
    return {
        x: position.x, y: position.y,
        width: internalNode.measured.width, height: internalNode.measured.height
    };
}

function getCenter(bounds) {
    return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
}

/**
 * Returns the point where the line from the center of the bounds
 * towards a target point crosses the border of the bounds.
 */
function getBorderPoint(bounds, target) {
    var center = getCenter(bounds);
    var dx = target.x - center.x, dy = target.y - center.y;
    if (dx == 0 && dy == 0) return center;
    var scale = Math.min(
        dx == 0 ? Infinity : (bounds.width / 2) / Math.abs(dx),
        dy == 0 ? Infinity : (bounds.height / 2) / Math.abs(dy));
    return { x: center.x + dx * scale, y: center.y + dy * scale };
}

/**
 * Returns the points of a straight edge between the borders of two nodes,
 * or of a loop on the right of a node for edges from a node to itself.
 */
function getFloatingPoints(sourceBounds, targetBounds, selfLoop) {
    if (selfLoop) {
        var right = sourceBounds.x + sourceBounds.width;
        var top = sourceBounds.y + sourceBounds.height / 3, bottom = sourceBounds.y + sourceBounds.height * 2 / 3;
        return [{ x: right, y: top }, { x: right + 20, y: top }, { x: right + 20, y: bottom }, { x: right, y: bottom }];
    }
    return [
        getBorderPoint(sourceBounds, getCenter(targetBounds)),
        getBorderPoint(targetBounds, getCenter(sourceBounds))
    ];
}

function getDashArray(pattern) {
    if (pattern == "dashed") return "6 4";
    if (pattern == "dotted") return "2 3";
    return undefined;
}

/**
 * Edges are drawn along the route computed by the layout. Once one of their
 * ends has been dragged elsewhere, they are drawn as straight lines between
 * the borders of their ends instead.
 */
function GraphEdge({ id, source, target, data }) {
    var sourceNode = useInternalNode(source);
    var targetNode = useInternalNode(target);
    if (!sourceNode || !targetNode) return null;

    var edge = data.edge;
    var points = data.points;
    var labelPosition = data.labelPosition;

    if (points == null) {
        points = getFloatingPoints(getBounds(sourceNode), getBounds(targetNode), source == target);
        labelPosition = getMidpoint(points);
    }
    else if (labelPosition == null) {
        labelPosition = getMidpoint(points);
    }

    var color = getEdgeColor(edge);
    return (
        <>
            <path id={id} className="react-flow__edge-path graph-edge-path" d={getPolylinePath(points)}
                stroke={color} strokeWidth={edge.style?.thickness || 1} strokeDasharray={getDashArray(edge.style?.pattern)}
                markerStart={getMarkerUrl(data.markerPrefix, edge, edge.sourceDecoration)}
                markerEnd={getMarkerUrl(data.markerPrefix, edge, edge.targetDecoration)} />
            {edge.label ?
                <EdgeLabelRenderer>
                    <div className="graph-edge-label nodrag nopan"
                        style={{ transform: `translate(-50%, -50%) translate(${labelPosition.x}px, ${labelPosition.y}px)` }}>
                        {(edge.label + "").split(/\n|\\n/).map((line, i) => <div key={i}>{line}</div>)}
                    </div>
                </EdgeLabelRenderer> : null}
        </>
    );
}

var edgeTypes = {
    graphEdge: GraphEdge
};

export { EdgeMarkers, edgeTypes };
