# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

The Epsilon Playground is a browser-only front end for running Eclipse Epsilon programs (EOL, EVL, ETL, EGL, EGX, EPL, EML, ECL, Flock, EMG, Pinset) against Flexmi models and Emfatic metamodels. It is a folder inside the Epsilon mkdocs website (`mkdocs/docs/playground`), so the site serves it at `/playground/`. All execution happens in remote backend services. This folder contains only static HTML, CSS and JS.

## Commands

- Build the bundle: `npx webpack --watch --mode=development` while developing, `npx webpack --mode=production` before pushing. `index.html` loads `dist/bundle.js`, and `dist/` is gitignored, so you must build before the page works.
- Serve only the front end: `npx live-server`. The full site, including the `serve-no-livereload.sh` script, is two levels up at the mkdocs root.
- Cypress e2e tests in `cypress/e2e/` (use Firefox; `download.cy.js` is flaky in other browsers):
  - Single spec: `npx cypress run --browser firefox --spec "cypress/e2e/eol.cy.js"`
  - All specs except the slow download spec: `npx cypress run --browser firefox --spec 'cypress/e2e/*.cy.js,!cypress/e2e/download.cy.js'`
  - Against a local stack: `./run-cypress-local.sh`. This script copies `backend.local.json` over `backend.json` and restores it with `git restore` on exit. It runs a dev webpack build, serves the site on :8000 with `serve-no-livereload.sh`, and starts the `ghcr.io/epsilonlabs/playground-backend/standalone-server` Docker image on :8080. It still needs internet access.
  - The tests target `playground` in `cypress/e2e/constants.js`, which is `http://localhost:8000/playground/` by default. A commented-out line points at production.
- Run Yjs locally for live sharing: `HOST=localhost PORT=1234 npx y-websocket`.

## Architecture

- **Entry point and global state:** `js/Playground.js` is the webpack entry. It creates every panel as an exported module-level singleton (`programPanel`, `firstModelPanel`, `outputPanel`, `backend`, etc.). Other modules import these singletons straight from `./Playground.js`, so the imports are circular by design. It also attaches functions that inline `onclick` handlers in `index.html` need (e.g. `runProgram`, `fit`, `showSettings`) to `window`.
- **Examples drive the layout:** `ExampleManager` loads `examples/examples.json` synchronously. A `?examples=<url>` query parameter can point it at a custom file instead. The query key with no value (e.g. `?etl`) chooses the example. Each example names its `language`, the files for `program`/`secondProgram`, `flexmi`/`secondFlexmi`/`thirdFlexmi` and `emfatic`/`secondEmfatic`/`thirdEmfatic`, and optionally `outputType` (`text`, `code`, `html`, `puml`, `dot`, …) and `outputLanguage`. `Layout.js` uses the language to pick which panels appear and how they are nested in `Splitter`s. To add an example, add its files under `examples/` and an entry in `examples.json`.
- **Panels:** `Panel` wraps a Monaco editor and its Metro UI toolbar. `ModelPanel` extends it with a diagram view: it sends Flexmi/Emfatic to the backend, which returns PlantUML rendered as SVG, then shows the SVG with `svg-pan-zoom`. `MetamodelPanel` and `OutputPanel` extend `ModelPanel`. `MonacoSetup.js` defines the Monarch syntax highlighting for each Epsilon language and for Emfatic.
- **Backend:** `Backend.js` reads `backend.json` synchronously and maps service names (`RunEpsilonFunction`, `FlexmiToPlantUMLFunction`, `EmfaticToPlantUMLFunction`, `ShortURLFunction`, `Yjs`, `Kroki`) to URLs. `backend.local.json` is the version for local development. `runProgram()` in `Playground.js` POSTs the contents of all editors to RunEpsilon. If an EGL output is `puml` or `dot`, it then sends the generated text to Kroki to get an SVG.
- **Sharing:** "Share Snapshot" base64-encodes the JSON from `editorsToJson()` and stores it through the ShortURL service. Live Share (`LiveShareManager`, `LiveShareDialog`) syncs editors through Yjs. `js/y-monaco.js` is a vendored copy of a fork of `y-monaco` with a bug fix. Do not replace it with the npm package until the upstream fix is merged.
- **Download:** `DownloadDialog` uses JSZip to build a runnable project from the Handlebars templates in `templates/` (Ant, Gradle and Maven, plus Java runners for each language).
- **Movable diagrams:** `js/MovableDiagram.js` lets users drag nodes in PlantUML class/object SVGs, and reroutes links with `libavoid-js` (WebAssembly). `SPECS.md` holds its detailed requirements. Keep `SPECS.md` in sync when you change this behaviour. It only works on SVGs from PlantUML ≥ 1.2026.1, which means Kroki ≥ 0.30.0 (see `readme.md`). Those SVGs mark nodes as `g.entity` or `g.cluster` with `data-qualified-name`, and links as `g.link` with `data-entity-1`/`data-entity-2`. `webpack.config.js` aliases `libavoid.wasm` to the binary inside `node_modules` and emits it as an asset. `ModelPanel` keeps the layout state (`diagramLayout`) across re-renders from the "Fit diagram" button only.
