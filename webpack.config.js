const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                use: 'ts-loader',
                exclude: /(node_modules|bower_components)/,
            },
            {
                test: /\.css/,
                type: 'asset/source',
            },
        ],
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js',
    },
    devServer: {
        host: 'localhost',
        port: 8800,
        hot: true,
        open: true,
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: './src/index.html',
        }),
    ],
};
