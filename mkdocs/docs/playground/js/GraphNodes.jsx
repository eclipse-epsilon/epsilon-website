import { Handle, Position } from '@xyflow/react';

/**
 * React components for the nodes of the JSON graphs returned by the backend.
 * NodeBody renders a node on its own, so that it can be measured before
 * the graph is laid out; GraphNode wraps it for React Flow.
 */

// Shapes whose outline is drawn as an SVG path, as CSS borders cannot draw them
var OUTLINED_SHAPES = ["hexagon", "database", "cloud", "file", "artifact", "folder", "package", "node", "frame", "note"];

// Shapes that render their label and text lines as a box with compartments
var BOX_SHAPES = ["object", "class"];

/**
 * Renders a label with line breaks (actual new lines, or \n as in PlantUML)
 * and the basic PlantUML creole markup: **bold**, //italic//, __underlined__
 * and ""monospaced"".
 */
function RichText({ text }) {
    if (text == null) return null;
    var lines = (text + "").split(/\n|\\n/);
    return lines.map((line, i) => <div key={i} className="graph-text-line">{renderCreole(line)}</div>);
}

var CREOLE = /\*\*(.+?)\*\*|\/\/(.+?)\/\/|__(.+?)__|""(.+?)""/g;

function renderCreole(line) {
    if (line.length == 0) return " ";
    var parts = [];
    var last = 0;
    for (const match of line.matchAll(CREOLE)) {
        if (match.index > last) parts.push(line.substring(last, match.index));
        var key = parts.length;
        if (match[1] != null) parts.push(<b key={key}>{renderCreole(match[1])}</b>);
        else if (match[2] != null) parts.push(<i key={key}>{renderCreole(match[2])}</i>);
        else if (match[3] != null) parts.push(<u key={key}>{renderCreole(match[3])}</u>);
        else parts.push(<code key={key}>{match[4]}</code>);
        last = match.index + match[0].length;
    }
    if (last < line.length) parts.push(line.substring(last));
    return parts;
}

function toPixels(value) {
    var number = parseFloat(value);
    return isNaN(number) ? undefined : number + "px";
}

/**
 * Maps the style of a node (colors, plus the PlantUML style options
 * of @node annotations) to CSS.
 */
function toCss(style = {}) {
    var css = {
        "--graph-fill": style.backgroundColor,
        "--graph-stroke": style.borderColor
    };
    if (style.fontName) css.fontFamily = style.fontName;
    if (style.fontColor) css.color = style.fontColor;
    if (style.fontSize) css.fontSize = toPixels(style.fontSize);
    if (style.fontStyle) {
        var fontStyle = style.fontStyle.toLowerCase();
        if (fontStyle.includes("bold")) css.fontWeight = "bold";
        if (fontStyle.includes("italic")) css.fontStyle = "italic";
    }
    if (style.lineThickness) css["--graph-stroke-width"] = toPixels(style.lineThickness);
    if (style.lineStyle) {
        var lineStyle = style.lineStyle.toLowerCase();
        css["--graph-stroke-style"] = lineStyle.includes("dot") ? "dotted" : (lineStyle == "solid" || lineStyle == "0" ? "solid" : "dashed");
    }
    if (style.roundCorner) css["--graph-radius"] = toPixels(style.roundCorner);
    if (style.halign) css.textAlign = style.halign;
    if (style.padding) css.padding = toPixels(style.padding);
    if (style.maximumWidth) css.maxWidth = toPixels(style.maximumWidth);
    if (style.shadowing && parseFloat(style.shadowing) > 0) css.boxShadow = "2px 2px 4px rgba(0, 0, 0, 0.3)";
    return css;
}

function Compartments({ compartments }) {
    return (compartments || []).filter(lines => lines.length > 0).map((lines, i) =>
        <div key={i} className="graph-compartment">
            {lines.map((line, j) => <div key={j} className="graph-text-line">{renderCreole(line + "")}</div>)}
        </div>
    );
}

/**
 * Object, class and enumeration boxes: a header with the label,
 * followed by compartments with attribute values, features or literals.
 */
function Box({ node, className, style, children }) {
    var header = node.kind == "enum" ?
        <><div className="graph-stereotype">«enumeration»</div><RichText text={node.label} /></> :
        <RichText text={node.label} />;

    return (
        <div className={"graph-box " + className} style={style}>
            <div className={"graph-box-header" + (node.abstract ? " graph-abstract" : "")}>{header}</div>
            <Compartments compartments={node.compartments} />
            {children}
        </div>
    );
}

/**
 * Draws the outline of shapes that cannot be drawn with CSS borders.
 * The outline is only drawn once the size of the node is known.
 */
function ShapeOutline({ shape, width, height }) {
    if (!width || !height) return null;
    var w = width, h = height;
    var paths = [];

    switch (shape) {
        case "hexagon": {
            var d = Math.min(h / 2, 16);
            paths.push(`M ${d} 0 L ${w - d} 0 L ${w} ${h / 2} L ${w - d} ${h} L ${d} ${h} L 0 ${h / 2} Z`);
            break;
        }
        case "database": {
            var ry = Math.min(8, h / 6);
            paths.push(`M 0 ${ry} A ${w / 2} ${ry} 0 0 1 ${w} ${ry} L ${w} ${h - ry} A ${w / 2} ${ry} 0 0 1 0 ${h - ry} Z`);
            paths.push(`M 0 ${ry} A ${w / 2} ${ry} 0 0 0 ${w} ${ry}`);
            break;
        }
        case "cloud": {
            var r = Math.min(h / 3, w / 6, 14);
            paths.push(`M ${r} ${h - r} A ${r} ${r} 0 0 1 ${r} ${r * 1.2} A ${r * 1.4} ${r * 1.4} 0 0 1 ${w / 2} ${r * 0.6} ` +
                `A ${r * 1.4} ${r * 1.4} 0 0 1 ${w - r} ${r * 1.2} A ${r} ${r} 0 0 1 ${w - r} ${h - r} ` +
                `A ${r * 1.6} ${r} 0 0 1 ${w / 2} ${h - r * 0.4} A ${r * 1.6} ${r} 0 0 1 ${r} ${h - r} Z`);
            break;
        }
        case "file":
        case "artifact":
        case "note": {
            var c = Math.min(10, w / 4, h / 4);
            paths.push(`M 0 0 L ${w - c} 0 L ${w} ${c} L ${w} ${h} L 0 ${h} Z`);
            paths.push(`M ${w - c} 0 L ${w - c} ${c} L ${w} ${c}`);
            break;
        }
        case "folder":
        case "package": {
            var tab = Math.min(w / 2, 40), t = 8;
            paths.push(`M 0 0 L ${tab} 0 L ${tab + t} ${t} L ${w} ${t} L ${w} ${h} L 0 ${h} Z`);
            paths.push(`M 0 ${t} L ${tab + t} ${t}`);
            break;
        }
        case "node": {
            var o = 8;
            paths.push(`M 0 ${o} L ${o} 0 L ${w} 0 L ${w} ${h - o} L ${w - o} ${h} L 0 ${h} Z`);
            paths.push(`M 0 ${o} L ${w - o} ${o} L ${w} 0 M ${w - o} ${o} L ${w - o} ${h}`);
            break;
        }
        case "frame": {
            paths.push(`M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`);
            break;
        }
    }

    return (
        <svg className="graph-shape-outline" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {paths.map((path, i) => <path key={i} d={path} className={i == 0 ? "graph-outline-main" : "graph-outline-detail"} />)}
        </svg>
    );
}

/**
 * Nodes of graphical syntax annotations (@node), rendered with their shape.
 */
function Shape({ node, style, width, height, container }) {
    var shape = (node.shape || "rectangle").toLowerCase();

    if (BOX_SHAPES.includes(shape) && !container) {
        return <Box node={node} className={"graph-shape-" + shape} style={style} />;
    }

    var outlined = OUTLINED_SHAPES.includes(shape);
    return (
        <div className={"graph-shape graph-shape-" + shape + (outlined ? " graph-outlined" : "") + (container ? " graph-container" : "")} style={style}>
            {outlined ? <ShapeOutline shape={shape} width={width} height={height} /> : null}
            {shape == "component" ? <span className="graph-component-icon" /> : null}
            <div className="graph-shape-text">
                {node.image ? <img className="graph-image" src={node.image} alt="" draggable="false" /> : null}
                <RichText text={node.label} />
            </div>
            {container ? null : <Compartments compartments={node.compartments} />}
        </div>
    );
}

/**
 * Renders a node of the graph. Nodes that contain other nodes only render
 * their header: their size is computed by the layout to fit their children.
 */
function NodeBody({ node, width, height, container = false }) {
    var style = toCss(node.style);

    switch (node.kind) {
        case "object":
        case "class":
        case "enum":
            return <Box node={node} className={"graph-" + node.kind} style={style} />;
        case "note":
            return (
                <div className="graph-shape graph-note graph-outlined" style={style}>
                    <ShapeOutline shape="note" width={width} height={height} />
                    <div className="graph-shape-text"><RichText text={node.label} /></div>
                </div>
            );
        case "junction":
            return <div className="graph-junction" />;
        default:
            return <Shape node={node} style={style} width={width} height={height} container={container} />;
    }
}

// Edges are drawn between node borders by GraphEdge, but React Flow
// still needs a source and a target handle in every node
function Handles() {
    return (
        <>
            <Handle type="target" position={Position.Top} className="graph-handle" isConnectable={false} />
            <Handle type="source" position={Position.Bottom} className="graph-handle" isConnectable={false} />
        </>
    );
}

function GraphNode({ data, width, height }) {
    return (
        <div className="graph-node" style={{ width: width, height: height }}>
            <Handles />
            <NodeBody node={data.node} width={width} height={height} container={data.container} />
        </div>
    );
}

function JunctionNode() {
    return (
        <>
            <Handles />
            <div className="graph-junction" />
        </>
    );
}

var nodeTypes = {
    graphNode: GraphNode,
    junction: JunctionNode
};

export { NodeBody, nodeTypes };
