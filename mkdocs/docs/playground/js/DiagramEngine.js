/**
 * The engines that can render the diagrams of models and metamodels.
 * A metamodel selects one with an annotation on its package, e.g.
 *
 * @diagram(engine="plantuml")
 * package foo;
 */
const DiagramEngine = {
    // SVGs rendered by the backend with PlantUML
    PLANTUML: "plantuml",
    // JSON graphs laid out and rendered in the browser with React Flow
    REACT_FLOW: "reactflow"
};

const DEFAULT_DIAGRAM_ENGINE = DiagramEngine.REACT_FLOW;

// Matches string literals (group 1), and comments
const STRINGS_AND_COMMENTS = /("(?:[^"\\]|\\.)*")|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;

// Matches string literals (group 1), and the package keyword
const STRINGS_AND_PACKAGE = /("(?:[^"\\]|\\.)*")|\bpackage\b/g;

// Matches @diagram annotations, capturing their details
const DIAGRAM_ANNOTATION = /@diagram\s*\(((?:"(?:[^"\\]|\\.)*"|[^)"])*)\)/g;

// Matches the engine detail of an annotation (the key may be quoted)
const ENGINE_DETAIL = /(?:^|[\s,])"?engine"?\s*=\s*"([^"]*)"/;

/**
 * Returns the diagram engine selected by the @diagram annotation
 * of the package of an Emfatic metamodel, or the default engine
 * if there is no such annotation (or if it names an unknown engine).
 */
function getDiagramEngine(emfatic) {
    var text = (emfatic || "").replace(STRINGS_AND_COMMENTS, (match, string) => string ?? " ");

    // Package annotations are the ones before the package keyword
    var packageIndex = -1;
    for (const match of text.matchAll(STRINGS_AND_PACKAGE)) {
        if (match[1] === undefined) {
            packageIndex = match.index;
            break;
        }
    }
    if (packageIndex < 0) return DEFAULT_DIAGRAM_ENGINE;

    for (const annotation of text.substring(0, packageIndex).matchAll(DIAGRAM_ANNOTATION)) {
        var engine = annotation[1].match(ENGINE_DETAIL);
        if (engine != null) {
            var name = engine[1].trim().toLowerCase();
            if (Object.values(DiagramEngine).includes(name)) return name;
        }
    }
    return DEFAULT_DIAGRAM_ENGINE;
}

export { DiagramEngine, getDiagramEngine };
