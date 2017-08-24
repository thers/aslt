const webpack = require('webpack');
const chalk = require('chalk');
const Q3Rcon = require('quake3-rcon');
const BitBarWebpackProgressPlugin = require("bitbar-webpack-progress-plugin");
const rconConfig = require('./.local.json');
const package = require('./package.json');

const rcon = new Q3Rcon({
    address: rconConfig.host || '127.0.0.1',
    port: rconConfig.port || 30120,
    password: rconConfig.password
});

const compiler = webpack({
    context: __dirname,
    devtool: false,
    entry: './src/index.ts',
    output: {
        filename: `./dist/${package.name}.js`
    },
    module: {
        rules: [
            {
                test: /.(ts|js)$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true // IMPORTANT! use transpileOnly mode to speed-up compilation
                }
            }
        ]
    },
    resolve: {
        extensions: [ '.ts', 'js' ]
    },
    plugins: [
        new BitBarWebpackProgressPlugin()
    ]
});

compiler.watch({
    ignored: /node_modules/
}, (err, stats) => {
    if (err !== null) {
        console.error(err);
        return;
    }

    console.log(
        chalk.green('Built new') +
        ` {${stats.hash}} in ${(stats.endTime - stats.startTime)/1000|0}s`
    );

    rcon.send(`restart ${package.name}`);
});
