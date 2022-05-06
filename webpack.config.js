import DefinePlugin from 'webpack/lib/DefinePlugin.js';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const IS_PROD = process.env.NODE_ENV === 'production';

export default function webpackConfig () {
  return {
    mode: IS_PROD ? 'production' : 'development',

    devtool: 'cheap-module-source-map',

    devServer: {
      hot: true,
      open: true,

      port: 8080,
      host: '0.0.0.0',

      proxy: {
        context: [ '**' ],
        target: `http://127.0.0.1:8081`,
        logLevel: 'debug',
      },
    },

    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    entry: path.resolve(__dirname, './src/entry.js'),

    output: {
      path: path.resolve(__dirname, './dist'),
      pathinfo: true,
      filename: 'js/entry.js',
      chunkFilename: 'js/[name].chunk.js',
      assetModuleFilename: 'static/media/[name].[hash][ext]',
    },

    module: {
      rules: [
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          include: path.resolve(__dirname, './src'),
          loader: 'babel-loader',
        },
      ],
    },

    resolve: {
      modules: [ 'node_modules', path.resolve(__dirname, '/node_modules') ],

      extensions: [
        '.js',
        '.mjs',
        '.cjs',
        '.json',
      ],
    },

    plugins: [

      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(IS_PROD ? 'production' : 'development'),
      }),

      new WebpackManifestPlugin({
        fileName: 'manifest.json',
        publicPath: '/',
        writeToFileEmit: true,
        generate: (seed, files, entrypoints) => {
          const chunks = files.reduce((arr, file) => {
            if (file.isChunk) arr.push(file.path);
            return arr;
          }, []);

          const entryPointFilterer = Object.entries(entrypoints).reduce((acc, e) => {
            const [ name, entryPointFiles ] = e;
            return {
              ...acc,
              [name]: entryPointFiles.filter(
                (fileName) => !fileName.endsWith('.map')
              ).map((ep) => `/${ep}`),
            };
          }, {});

          return {
            chunks,
            entrypoints: entryPointFilterer,
          };
        },
      }),
    ],

  };
}
