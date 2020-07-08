const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");

module.exports = {
	mode: "production",
	devtool: "none",
	entry: "./src/index.js",
	output: {
		path: __dirname + "/js/",
		filename: "index.bundle.[chunkhash].js"
	},
	module: {},
	plugins: [
		new CleanWebpackPlugin()
	],
	optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    output: {
                        comments: false
                    }
                }
			})
        ]
    }
};