const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: "production",
    devtool: "source-map",
    target: [
        "web",
        "es6"
    ],
    entry: {
        index: "./src/index.js"
    },
    output: {
        filename: "[name].bundle.min.js",
        path: path.resolve(__dirname, "www"),
    },
    plugins: [
        new HtmlWebpackPlugin(
            {
                title: "Tag!",
                filename: "index.html",
                template: "./src/index.ejs",
                inject: "body"
            }
        ),
        new MiniCssExtractPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env"
                        ],
                        plugins: [
                            "@babel/plugin-proposal-class-properties",
                            "@babel/plugin-proposal-object-rest-spread"
                        ]
                    }
                }
            },
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            }
        ]
    }
};
