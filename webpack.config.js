const path = require("path");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
	mode: "development",
	devtool: "none",
	entry: "./js/index.js",
	plugins: [
		new CleanWebpackPlugin()
	],
	rules: [{
		test: /\.js$/,
		use: {
			loader: "babel-loader",
			options: {
				presets: ["@babel/preset-env"]
			}
		}
	}],
	optimization: {
        minimizer: [
            new TerserPlugin({
                cache: true,
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