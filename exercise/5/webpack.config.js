const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "production",
    entry: {
        sysmon: "./src/sysmon.js"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "build"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Sysmon",
            filename: "sysmon.html",
            template: "./src/sysmon.ejs",
            inject: "head"
        })
    ]
};
