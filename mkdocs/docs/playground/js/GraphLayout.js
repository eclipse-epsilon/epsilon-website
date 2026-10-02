import ELK from 'elkjs/lib/elk.bundled.js';

/**
 * Lays out the JSON graphs returned by the backend's *2graph services
 * using the layered algorithm of the Eclipse Layout Kernel (ELK), and
 * turns them into React Flow nodes and edges.
 */

var elk = new ELK();

// Space between the border of a node that contains other nodes and its children
var CONTAINER_PADDING = 12;

var LAYOUT_OPTIONS = {
    "elk.algorithm": "layered",
    "elk.hierarchyHandling": "INCLUDE_CHILDREN",
    "elk.edgeRouting": "ORTHOGONAL",
    "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
    "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
    "elk.spacing.nodeNode": "40",
    "elk.layered.spacing.nodeNodeBetweenLayers": "50",
    "elk.spacing.edgeNode": "20",
    "elk.spacing.edgeEdge": "12",
    "elk.spacing.edgeLabel": "4",
    "elk.json.edgeCoords": "ROOT"
};

/**
 * Returns the nodes of the graph grouped by the id of their parent
 * (null for top-level nodes). Nodes whose parent is not in the graph
 * are treated as top-level nodes.
 */
function getChildren(graph) {
    var ids = new Set(graph.nodes.map(node => node.id));
    var children = new Map();
    for (const node of graph.nodes) {
        var parent = ids.has(node.parent) ? node.parent : null;
        if (!children.has(parent)) children.set(parent, []);
        children.get(parent).push(node);
    }
    return children;
}

/**
 * Edges whose direction hint is up or left go against the flow of the
 * layout (e.g. inheritance edges, which point from subclasses at the bottom
 * to superclasses at the top), so they are reversed for the layout.
 */
function isReversed(edge) {
    return edge.direction == "up" || edge.direction == "left";
}

/**
 * Lays out a graph.
 *
 * @param graph the graph returned by the backend
 * @param nodeSizes a map from node ids to their {width, height}; for nodes that
 *        contain other nodes, this is the size of their header
 * @param labelSizes a map from edge ids to the {width, height} of their labels
 * @returns a promise of {nodes, edges} for React Flow
 */
async function layoutGraph(graph, nodeSizes, labelSizes) {
    var children = getChildren(graph);
    var nodeIds = new Set(graph.nodes.map(node => node.id));
    var edges = graph.edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));

    var toElkNode = function (node) {
        var size = nodeSizes.get(node.id);
        var elkNode = { id: node.id, width: size.width, height: size.height };
        if (children.has(node.id)) {
            elkNode.children = children.get(node.id).map(toElkNode);
            elkNode.layoutOptions = {
                "elk.padding": "[top=" + (size.height + CONTAINER_PADDING) + ",left=" + CONTAINER_PADDING +
                    ",bottom=" + CONTAINER_PADDING + ",right=" + CONTAINER_PADDING + "]",
                "elk.nodeSize.constraints": "MINIMUM_SIZE",
                "elk.nodeSize.minimum": "(" + size.width + "," + size.height + ")"
            };
        }
        return elkNode;
    };

    var elkGraph = {
        id: "root",
        layoutOptions: { ...LAYOUT_OPTIONS, "elk.direction": graph.direction == "RIGHT" ? "RIGHT" : "DOWN" },
        children: (children.get(null) || []).map(toElkNode),
        edges: edges.map(edge => {
            var elkEdge = {
                id: edge.id,
                sources: [isReversed(edge) ? edge.target : edge.source],
                targets: [isReversed(edge) ? edge.source : edge.target]
            };
            if (labelSizes.has(edge.id)) {
                elkEdge.labels = [{ id: edge.id + "Label", text: edge.label, ...labelSizes.get(edge.id) }];
            }
            return elkEdge;
        })
    };

    var layout = await elk.layout(elkGraph);

    return {
        nodes: toFlowNodes(graph, layout, children),
        edges: toFlowEdges(edges, layout)
    };
}

function toFlowNodes(graph, layout, children) {
    var graphNodes = new Map(graph.nodes.map(node => [node.id, node]));
    var flowNodes = [];

    // React Flow needs parents to come before their children
    var visit = function (elkNode, parentId) {
        var node = graphNodes.get(elkNode.id);
        var flowNode = {
            id: node.id,
            type: node.kind == "junction" ? "junction" : "graphNode",
            position: { x: elkNode.x, y: elkNode.y },
            width: elkNode.width,
            height: elkNode.height,
            data: { node: node, container: children.has(node.id) }
        };
        if (parentId != null) {
            flowNode.parentId = parentId;
            flowNode.extent = "parent";
        }
        flowNodes.push(flowNode);
        for (const child of elkNode.children || []) {
            visit(child, node.id);
        }
    };

    for (const elkNode of layout.children || []) {
        visit(elkNode, null);
    }
    return flowNodes;
}

function toFlowEdges(edges, layout) {
    var elkEdges = new Map();
    var collect = function (elkNode) {
        for (const elkEdge of elkNode.edges || []) elkEdges.set(elkEdge.id, elkEdge);
        for (const child of elkNode.children || []) collect(child);
    };
    collect(layout);

    return edges.filter(edge => !edge.hidden).map(edge => {
        var elkEdge = elkEdges.get(edge.id);
        var points = null;
        var labelPosition = null;

        if (elkEdge && elkEdge.sections && elkEdge.sections.length > 0) {
            points = [];
            for (const section of elkEdge.sections) {
                points.push(section.startPoint, ...(section.bendPoints || []), section.endPoint);
            }
            if (isReversed(edge)) points.reverse();
        }
        if (elkEdge && elkEdge.labels && elkEdge.labels.length > 0) {
            var label = elkEdge.labels[0];
            labelPosition = { x: label.x + label.width / 2, y: label.y + label.height / 2 };
        }

        return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: "graphEdge",
            data: { edge: edge, points: points, labelPosition: labelPosition }
        };
    });
}

export { layoutGraph };
