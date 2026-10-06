# Development Instructions

The Playground uses `webpack` for compiling dependencies and custom JavaScript into a single `bundle.js` file under `dist`, which is then used in `index.html`. To rebuild `bundle.js` you need to run the following commands:

- `npx webpack --watch --mode=development` for a development build (faster build, larger `bundle.js`)
- `npx webpack --mode=production` before you push to GitHub (slower build, smaller `bundle.js`)

To only run the Playground front-end, you can use the following command:

`npx live-server`

## Kroki version

EGL programs with an output type of `puml` or `dot` are rendered to SVG through the Kroki service configured in `backend.json` (and `backend.local.json`). The Kroki instance must be **version 0.30.0 or later**, as it is the first release that bundles PlantUML 1.2026.1 or later.

`MovableDiagram` only makes PlantUML diagrams movable when their SVG has the structure introduced in PlantUML 1.2026.1: nodes are `g.entity` / `g.cluster` groups with a `data-qualified-name` attribute, and links are `g.link` groups whose `data-entity-1` / `data-entity-2` attributes hold the `id`s of their ends. Older versions produce SVGs that do not match this structure, so the diagrams stay static:

| Kroki         | PlantUML  | SVG structure                                                                   |
|---------------|-----------|---------------------------------------------------------------------------------|
| up to 0.27.0  | 1.2024.1  | `<g id="elem_A">`: no `entity` / `cluster` / `link` classes                     |
| 0.28.0–0.29.1 | 1.2025.x  | `<g class="entity" id="entity_A">`, but links reference entity names (`A`), not `id`s, and there is no `data-qualified-name` |
| 0.30.0+       | 1.2026.1+ | `<g class="entity" id="ent0003" data-qualified-name="p.A">`, links reference `id`s |

To check the versions used by a Kroki instance, query its `/health` endpoint (e.g. `curl <kroki-url>/health`) and look at the `kroki` and `plantuml` entries.

## Testing on the production deployment

We use [Cypress](https://cypress.io) for automated testing. Tests are stored under the `cypress/e2e` folder. To run a single test, you need to use the following command:

- `npx cypress run --browser firefox --spec "cypress/e2e/eol.cy.js"`

To run all the end-to-end tests under `cypress/e2e`, you can use the following command:

- `npx cypress run --browser firefox --spec "cypress/e2e/*.cy.js"`

To exclude `download.cy.js`, which takes a while to run, you can use the following command:

- `npx cypress run --browser firefox --spec 'cypress/e2e/*.cy.js,!cypress/e2e/download.cy.js'`

Note: When the browser is not set to `firefox`, tests in `download.cy.js` can be flaky.

## Testing on a local deployment

To run the Cypress tests on a locally-running Playground, run:

```shell
./run-cypress-local.sh
```

The script will use the `standalone-server` image of the Playground, and use a local `/shorturl` service based on local files.

*Note*: this script still requires a working internet connection, as the playground loads some resources from the internet.

### Disable Live Reloading

To speed up test execution, please disable live reloading by serving the website using the following command.

```
./serve-no-livereload.sh
```

## Running YJS locally

YJS enables live collaboration in the Playground. To run YJS locally, run:

- `npm i y-websocket`
- `HOST=localhost PORT=1234 npx y-websocket`

## y-monaco

`y-monaco.js` is a local copy of a [forked version](https://github.com/kolovos/y-monaco/blob/master/src/y-monaco.js) of the `y-monaco` npm package. The original package suffers from [an issue](https://github.com/yjs/y-monaco/pull/23)) that has been fixed in the fork. The fix has been proposed by others to the package maintainer however, it has not been accepted yet. Once the fix is accepted, we can use the npm package again.