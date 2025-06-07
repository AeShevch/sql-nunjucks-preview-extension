'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node',
  mode: 'none',

  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode',
    'fsevents': 'commonjs fsevents',
    'chokidar': 'commonjs chokidar'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@application': path.resolve(__dirname, 'src/application'),
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
      '@commands': path.resolve(__dirname, 'src/commands'),
      '@presentation': path.resolve(__dirname, 'src/presentation'),
      '@types': path.resolve(__dirname, 'src/types')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json'
            }
          }
        ]
      }
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log",
  },
  ignoreWarnings: [
    {
      module: /nunjucks/,
      message: /Critical dependency: the request of a dependency is an expression/,
    },
  ],
};

module.exports = config; 