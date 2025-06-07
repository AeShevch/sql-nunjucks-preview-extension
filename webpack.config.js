'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const extensionConfig = {
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

/**@type {import('webpack').Configuration}*/
const reactConfig = {
  target: 'web',
  mode: 'none',

  entry: './src/presentation/components/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'react-bundle.js',
    library: {
      type: 'umd',
    },
  },
  plugins: [
    new (require('webpack')).DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process': JSON.stringify({
        env: { NODE_ENV: 'production' },
        browser: true
      })
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@application': path.resolve(__dirname, 'src/application'),
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
      '@commands': path.resolve(__dirname, 'src/commands'),
      '@presentation': path.resolve(__dirname, 'src/presentation'),
      '@types': path.resolve(__dirname, 'src/types'),
      // Preact aliases
      'react': 'preact/compat',
      'react-dom': 'preact/compat'
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json'
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log",
  },
};

module.exports = [extensionConfig, reactConfig]; 