const path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    publicPath: 'dist/',
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  }
};