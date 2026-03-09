const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const webpack = require('webpack');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/backend'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new webpack.IgnorePlugin({ resourceRegExp: /^@nestjs\/microservices$/ }),
    new webpack.IgnorePlugin({ resourceRegExp: /^@nestjs\/microservices\/microservices-module$/ }),
    new webpack.IgnorePlugin({ resourceRegExp: /^@nestjs\/websockets$/ }),
    new webpack.IgnorePlugin({ resourceRegExp: /^@nestjs\/websockets\/socket-module$/ }),
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMaps: true,
    }),
  ],
};
