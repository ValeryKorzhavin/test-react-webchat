module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    main: [
      '@babel/polyfill',
      `${__dirname}/src/index.jsx`,
    ],
    bootstrap: [
      'bootstrap/dist/js/bootstrap.js',
      'bootstrap/dist/css/bootstrap.min.css',
    ],
  },
  externals: {
    gon: 'gon',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    path: `${__dirname}/dist/public`,
    publicPath: '/assets/',
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
