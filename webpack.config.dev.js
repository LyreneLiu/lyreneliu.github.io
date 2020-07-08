const path = require("path");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");

module.exports = {
	mode: "development",
	devtool: "none",
	entry: "./src/index.js",
	output: {
		path: __dirname + "/js/",
		filename: "index.bundle.js"
	},
	module: {},
	plugins: [
		new CleanWebpackPlugin()
	],
};