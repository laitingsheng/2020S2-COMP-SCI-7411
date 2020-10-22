const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "production",
    devtool: "source-map",
    target: [
        "web",
        "es6"
    ],
    entry: {
        sysmon: "./src/sysmon.js"
    },
    output: {
        filename: "[name].bundle.min.js",
        path: path.resolve(__dirname, "build"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Sysmon",
            filename: "sysmon.html",
            template: "./src/sysmon.ejs",
            inject: "body"
        })
    ]
};
