const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = fs.realpathSync(process.cwd());

const resolveAppPath = relativePath => path.resolve(appDirectory, relativePath);

// Host
const host = process.env.HOST || 'localhost';

// Required for babel-preset-react-app
process.env.NODE_ENV = 'development';

module.exports = {
    mode: 'development',
    entry: resolveAppPath('src'),
    output: {
        publicPath: '/',
        path: path.join(__dirname, 'dist'),
        filename: 'static/js/bundle.js'
    },
    devServer: {
        static: { directory: resolveAppPath('public') },
        proxy:{
            '/api': {
                target: {
                    host: "0.0.0.0",
                    port: 3001,
                    protocol: "http"
                },
                pathRewrite: {
                    '^/api': ''
                }
            }
        },
        compress: true,
        historyApiFallback: true,
        host: host,
        port: 3000,
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.(s?)css$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource'
            }
        ]
    },
    plugins: [
        // Re-generate index.html with injected script tag.
        // The injected script tag contains a src value of the
        // filename output defined above.
        new HtmlWebpackPlugin({
            inject: true,
            template: resolveAppPath('public/static.html'),
        }),
    ],
}