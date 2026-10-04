# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The Epsilon Playground: a browser-only front-end for writing and running [Eclipse Epsilon](https://eclipse.dev/epsilon) programs (EOL, EVL, ETL, EGL, EGX, EPL, EML/ECL, EMG, Flock, Pinset) against Flexmi models and Emfatic metamodels. It lives inside the Epsilon website (mkdocs). The page is served statically, and all execution happens on remote backend services.

## Commands

Run these from this directory. Full notes are in `readme/index.html`, which is a rendered mkdocs page.

- Dev build: `npx webpack --watch --mode=development`
- Production build: `npx webpack --mode=production`. Run it before pushing. `dist/` (including `dist/bundle.js`) is committed, and `index.html` loads it directly, so source changes in `js/` have no effect until you rebuild.
- Serve the front-end only: `npx live-server`. To serve without live reload, which makes tests faster, use `../../serve-no-livereload.sh` at the website root.
- Cypress e2e tests, kept in `cypress/e2e/`, run against the production backend:
  - Single test: `npx cypress run --browser firefox --spec "cypress/e2e/eol.cy.js"`
  - All tests: `npx cypress run --browser firefox --spec "cypress/e2e/*.cy.js"`
  - Skip the slow download test: `npx cypress run --browser firefox --spec 'cypress/e2e/*.cy.js,!cypress/e2e/download.cy.js'`
  - Use Firefox. `download.cy.js` is flaky in other browsers.
- Run the e2e tests against a local backend with `./run-cypress-local.sh`. The script:
  - temporarily copies `backend.local.json` over `backend.json` and restores it with `git restore` on exit
  - builds the bundle and serves it on port 8000
  - starts `ghcr.io/epsilonlabs/playground-backend/standalone-server` in Docker on port 8080
  - still needs internet access for some resources
- Run Yjs locally for live share: `npm i y-websocket && HOST=localhost PORT=1234 npx y-websocket`

## Architecture

**Entry point and globals.** `js/Playground.js` is the webpack entry. At module load it creates every panel as a singleton and exports it: `programPanel`, `secondProgramPanel`, `first/second/thirdModelPanel`, `first/second/thirdMetamodelPanel`, `outputPanel`, `consolePanel`. It also creates the managers. Other modules import these singletons back from `Playground.js`, so the imports are circular. Many of these objects and functions are also assigned to `window.*`, because inline `onclick` handlers call them. Panel buttons, for example, generate code like `onclick: this.id + "Panel.refreshDiagram()"`, which expects a global called `<id>Panel`. If you add a panel or a button handler, you must expose it on `window`.

**Language drives everything.** Most behaviour is chosen by `if (language == ...)` chains on the current example's `language`. A new language or language variant needs changes in all of these places:
- `Layout.js`: the nested `Splitter` tree that arranges the panels
- `Playground.js` `arrangePanels()`: panel titles and icons, and whether a panel shows a diagram or an editor
- `Playground.js` `runProgram()`: how the backend response is rendered
- `Playground.js` `getActivePanels()`: which panels are used by Settings and live share
- `DownloadDialog.js`: which files go into the zip, plus the template flags
- `MonacoSetup.js`: syntax highlighting

`outputType` (`code`, `html`, `puml`, `dot`) and `outputLanguage` further change how EGL and EGX output is shown. For `puml` and `dot`, the generated text is posted to Kroki to be rendered.

**Panels.** `Panel.js` is the base class and wraps one Monaco editor. `ModelPanel` adds a diagram view. Model and metamodel diagrams are rendered with React Flow or PlantUML (see **Diagrams** below). It also switches between XML and YAML highlighting depending on whether the content starts with `<`. `OutputPanel` extends `ModelPanel`. `MetamodelPanel`, `ProgramPanel` and `ConsolePanel` follow the same pattern. `Splitter.js` builds the resizable layout.

**Backend.** `Backend.js` reads `backend.json` synchronously at startup to map service names to URLs:
- `RunEpsilonFunction`
- `FlexmiToGraphFunction`
- `EmfaticToGraphFunction`
- `FlexmiToPlantUMLFunction`
- `EmfaticToPlantUMLFunction`
- `ShortURLFunction`
- `Yjs`
- `Kroki`

`backend.local.json` is the localhost variant. To run a program, the page POSTs `editorsToJsonObject()` with `function: "RunEpsilon"`, plus `diagramFormat: "graph"` unless the output model's metamodel selects PlantUML (see **Diagrams**). The response contains fields such as `output`, `error`, `modelGraph` (the graph of the target, validated or pattern-matched model), `generatedText` and `generatedFiles`.

**Diagrams.** Two engines can render model and metamodel diagrams. A metamodel chooses one with an annotation on its package, `@diagram(engine="plantuml")` or `@diagram(engine="reactflow")`. React Flow is the default. `DiagramEngine.js` parses the annotation from the Emfatic text. Model panels use their metamodel panel's engine, and `runProgram()` uses the engine of the output model's metamodel. With PlantUML, the panels call the `*2plantuml` services and the backend returns SVGs (`modelDiagram`/`metamodelDiagram`, and `targetModelDiagram`, `validatedModelDiagram` or `patternMatchedModelDiagram` from `RunEpsilon`). These are shown with `ModelPanel.renderSvgDiagram`. With React Flow, the `*2graph` services (in [playground-backend](https://github.com/epsilonlabs/playground-backend), see its `core/README.md` for the format) return graphs of nodes (`object`, `class`, `enum`, `shape`, `note`, `junction`) and edges, with colours already converted to CSS. `GraphDiagram.jsx` renders them inside a panel's diagram element: it renders the nodes and edge labels off-screen to measure them, lays the graph out with ELK (`GraphLayout.js`), and then renders a React Flow diagram with the custom nodes in `GraphNodes.jsx` and edges in `GraphEdges.jsx`. Edges follow the ELK routes until one of their ends is dragged. The `.jsx` files are compiled by `babel-loader`. Metro UI's global `.draggable` class clashes with React Flow's, and `css/graph.css` overrides it. EGL output with `outputType` `puml` or `dot` is still rendered as SVG by Kroki, with `svg-pan-zoom` (`ModelPanel.renderSvgDiagram`).

**Examples.** `examples/examples.json` defines the examples and nested groups of examples. Each example has an `id` and a `language`. It names its files with the keys `program`, `secondProgram`, `flexmi`, `emfatic`, `secondFlexmi`, `secondEmfatic`, `thirdFlexmi` and `thirdEmfatic`, all relative to `examples/`. It can also set `outputType` and `outputLanguage`. `ExampleManager` reads the example from the URL:
- The first query key with no value is the example id, as in `?eol`.
- `?examples=<url>` loads a custom examples file instead.
- An id that isn't in the examples file is treated as a short-URL snapshot and fetched from `ShortURLFunction`, which returns base64-encoded editor JSON.

All of these fetches are synchronous XHRs.

**Live share.** `LiveShareManager.js` uses Yjs over `WebsocketProvider`. It gives each active editor its own room, named `epsilon-playground-<sessionId>-<panelId>`, and joins a session when `?session=<id>` is in the URL. `js/y-monaco.js` is a vendored copy of a fork of `y-monaco` that carries an unmerged upstream fix. Edit it in place, and don't replace it with the npm package until that fix is released.

**Download.** `DownloadDialog.js` uses JSZip and Handlebars to package the current editors with the templates in `templates/` (`gradle`, `maven`, `ant`, and `java/<language>`) into a runnable project.

**UI library.** The UI uses Metro UI 4: `Metro.dialog`, `Metro.notify`, `data-role` attributes, and `css/metro-all.min.css`. It also uses jQuery `$`. Monaco is themed as `playground` in `MonacoSetup.js`.
