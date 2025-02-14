# Development Instructions

The Playground uses `webpack` for compiling dependencies and custom JavaScript into a single `bundle.js` file under `dist`, which is then used in `index.html`. To rebuild `bundle.js` you need to run the following commands:

- `npx webpack --watch --mode=development` for a development build (faster build, larger `bundle.js`)
- `npx webpack --mode=production` before you push to GitHub (slower build, smaller `bundle.js`)

## Testing on the production deployment

We use [Cypress](https://cypress.io) for automated testing. Tests are stored under the `cypress/e2e` folder. To run a single test, you need to use the following command:

- `npx cypress run --browser firefox --spec "cypress/e2e/eol.cy.js"`

To run all the end-to-end tests under `cypress/e2e`, you can use the following command:

- `npx cypress run --browser firefox --spec "cypress/e2e/*.cy.js"`

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