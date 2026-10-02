import { useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { ReactFlow, ReactFlowProvider, Controls, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../css/graph.css';

import { layoutGraph } from './GraphLayout.js';
import { NodeBody, nodeTypes } from './GraphNodes.jsx';
import { EdgeMarkers, edgeTypes } from './GraphEdges.jsx';

// How long to wait for the images of nodes to load before measuring the nodes
var IMAGE_TIMEOUT_MILLIS = 3000;

function DiagramFlow({ initialNodes, initialEdges, graph, markerPrefix, onInit }) {
    var [nodes, , onNodesChange] = useNodesState(initialNodes);
    var [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Once a node is dragged, the routes computed by the layout for the edges
    // of the node (and of the nodes it contains) are no longer valid
    var onNodeDragStart = useCallback((event, node) => {
        var moved = new Set([node.id]);
        var size;
        do {
            size = moved.size;
            for (const n of graph.nodes) {
                if (moved.has(n.parent)) moved.add(n.id);
            }
        } while (moved.size != size);

        setEdges(edges => edges.map(edge =>
            edge.data.points != null && (moved.has(edge.source) || moved.has(edge.target)) ?
                { ...edge, data: { ...edge.data, points: null, labelPosition: null } } : edge));
    }, [graph, setEdges]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStart={onNodeDragStart}
            onInit={onInit}
            fitView
            fitViewOptions={{ padding: 0.05, maxZoom: 1 }}
            minZoom={0.05}
            maxZoom={4}
            nodesConnectable={false}
            elementsSelectable={false}
            edgesFocusable={false}
            deleteKeyCode={null}>
            <EdgeMarkers prefix={markerPrefix} edges={graph.edges} />
            <Controls showInteractive={false} />
        </ReactFlow>
    );
}

function loadImages(graph) {
    var urls = [...new Set(graph.nodes.filter(node => node.image).map(node => node.image))];
    return Promise.all(urls.map(url => new Promise(resolve => {
        var image = new Image();
        image.onload = image.onerror = resolve;
        setTimeout(resolve, IMAGE_TIMEOUT_MILLIS);
        image.src = url;
    })));
}

/**
 * Renders the nodes and edge labels of a graph off-screen, and returns
 * their sizes. For nodes that contain other nodes, only their header is
 * rendered: the layout makes room for their children.
 */
function measure(graph) {
    var host = document.createElement("div");
    host.className = "graph-measure";
    document.body.appendChild(host);
    var root = createRoot(host);

    var parents = new Set(graph.nodes.map(node => node.parent));
    var labelledEdges = graph.edges.filter(edge => edge.label != null && !edge.hidden);

    try {
        flushSync(() => root.render(
            <>
                {graph.nodes.map(node =>
                    <div key={node.id} className="graph-measure-item" data-node={node.id}>
                        <NodeBody node={node} container={parents.has(node.id)} />
                    </div>)}
                {labelledEdges.map(edge =>
                    <div key={edge.id} className="graph-measure-item graph-edge-label" data-edge={edge.id}>
                        {(edge.label + "").split(/\n|\\n/).map((line, i) => <div key={i}>{line}</div>)}
                    </div>)}
            </>
        ));

        var getSize = element => ({
            width: Math.ceil(element.offsetWidth),
            height: Math.ceil(element.offsetHeight)
        });

        var nodeSizes = new Map();
        var labelSizes = new Map();
        for (const element of host.querySelectorAll("[data-node]")) {
            nodeSizes.set(element.dataset.node, getSize(element));
        }
        for (const element of host.querySelectorAll("[data-edge]")) {
            labelSizes.set(element.dataset.edge, getSize(element));
        }
        return { nodeSizes, labelSizes };
    }
    finally {
        root.unmount();
        host.remove();
    }
}

/**
 * Renders the JSON graphs returned by the backend as interactive
 * React Flow diagrams, inside a given element.
 */
class GraphDiagram {

    element;
    id;
    container;
    root;
    flow; // The React Flow instance of the current diagram
    renders = 0;

    constructor(element, id) {
        this.element = element;
        this.id = id;
    }

    getRoot() {
        if (this.root == null || !this.container.isConnected) {
            if (this.root != null) this.root.unmount();
            this.container = document.createElement("div");
            this.container.className = "graph-diagram";
            this.element.replaceChildren(this.container);
            this.root = createRoot(this.container);
        }
        return this.root;
    }

    /**
     * Lays out and renders a graph. Returns a promise that resolves once the
     * graph has been rendered (or superseded by another call).
     */
    async render(graph) {
        var render = ++this.renders;
        await loadImages(graph);
        if (render != this.renders) return;

        var { nodeSizes, labelSizes } = measure(graph);
        var { nodes, edges } = await layoutGraph(graph, nodeSizes, labelSizes);
        if (render != this.renders) return;

        var markerPrefix = this.id + "Marker" + render;
        for (const edge of edges) edge.data.markerPrefix = markerPrefix;

        this.flow = null;
        this.getRoot().render(
            <ReactFlowProvider key={render}>
                <DiagramFlow initialNodes={nodes} initialEdges={edges} graph={graph}
                    markerPrefix={markerPrefix} onInit={flow => this.flow = flow} />
            </ReactFlowProvider>
        );
    }

    /**
     * Replaces the diagram with a message (e.g. a preloader or an error).
     */
    showMessage(message) {
        this.renders++;
        this.flow = null;
        this.getRoot().render(<div className="graph-message">{message}</div>);
    }

    showLoading() {
        this.showMessage(<img src="images/preloader.gif" style={{ width: "100px", margin: "auto" }} />);
    }

    showError(message) {
        this.showMessage(
            <div className="model-rendering-error">
                <span className="mif-16 mif-problems" style={{ position: "relative", top: "-1px", paddingRight: "5px" }}></span>
                {message}
            </div>);
    }

    clear() {
        this.showMessage(null);
    }

    fit() {
        if (this.flow != null) this.flow.fitView({ padding: 0.05, maxZoom: 1, duration: 200 });
    }
}

export { GraphDiagram };
