# Development Instructions

The Playground uses `webpack` for compiling dependencies and custom JavaScript into a single `bundle.js` file under `dist`. To rebuild `bundle.js` you need to run the following commands:

- `npx webpack --watch --mode=development` for a development build (faster build, larger `bundle.js`)
- `npx webpack --mode=production` before you push to GitHub (slower build, smaller `bundle.js`)