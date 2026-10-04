const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './js/Playground.js',
  output: {
    publicPath: 'dist/',
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map', // Add this line to enable source maps
  module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.ttf$/,
				type: 'asset/resource'
			},
			{
				test: /\.wasm$/,
				type: 'asset/resource'
			}
		]
	},
	resolve: {
		alias: {
			// libavoid-js doesn't export its WebAssembly binary
			'libavoid.wasm$': path.resolve(__dirname, 'node_modules/libavoid-js/dist/libavoid.wasm')
		}
	},
	plugins: [new MonacoWebpackPlugin()]
};