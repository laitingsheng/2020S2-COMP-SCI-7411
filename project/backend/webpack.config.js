const path = require("path");

module.exports = {
    mode: "production",
    devtool: 'source-map',
    entry: "./src/index.js",
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "build"),
    },
    target: 'node'
}
