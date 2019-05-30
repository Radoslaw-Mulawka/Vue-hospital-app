const webpack = require('webpack');
const date = new Date();
const dateFormat = `${date.getFullYear()}${date.getMonth()}${date.getDate()}${date.getHours()}`;
const path = require('path');

if(process.env.NODE_ENV === 'development'){
  module.exports = {
    configureWebpack: {
      plugins: [
        new webpack.ProvidePlugin({
          $: 'jquery',
          jquery: 'jquery',
          'window.jQuery': 'jquery',
          jQuery: 'jquery',
        }),
      ],
    },
  }
}
else {
  module.exports = {
    css: {
      extract: {
        filename: `assets/css/[name].${dateFormat}.css`,
        chunkFilename: `assets/css/[name].${dateFormat}.css`,
      },
    },
    configureWebpack: {
      plugins: [
        new webpack.ProvidePlugin({
          $: 'jquery',
          jquery: 'jquery',
          'window.jQuery': 'jquery',
          jQuery: 'jquery',
        }),
      ],
    },
  
    chainWebpack: config => {
      const inlineLimit = 10000;
      const assetsPath = 'assets';
  
      config
        .output
        .filename(path.join(assetsPath, `js/[name].${dateFormat}.js`))
        .chunkFilename(path.join(assetsPath, `/js/[name].${dateFormat}.js`));
  
      config.module
        .rule('images')
        .test(/\.(png|jpe?g|gif)(\?.*)?$/)
        .use('url-loader')
        .loader('url-loader')
        .options({
          limit: inlineLimit,
          name: path.join(assetsPath, `img/[name].${dateFormat}.[ext]`),
        });
  
      config.module
        .rule('svg')
        .use('file-loader')
        .loader('file-loader')
        .options({
          limit: inlineLimit,
          name: path.join(assetsPath, `img/[name].${dateFormat}.[ext]`),
        });
  
      config.module
        .rule('fonts')
        .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
        .use('url-loader')
        .loader('url-loader')
        .options({
          limit: inlineLimit,
          name: path.join(assetsPath, `fonts/[name].${dateFormat}.[ext]`),
        });
  
      config.module
        .rule('css')
        // .test(/\.(css)(\?.*)?$/)
        .use('url-loader')
        .loader('url-loader')
        .options({
          limit: inlineLimit,
          name: path.join(assetsPath, `css/[name].${dateFormat}.[ext]`),
        });
    },
  
    assetsDir: 'assets',
  };
}
