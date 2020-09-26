/**
 * metalsmith-ssgs
 * Static site generator
 *
 * @author Antonio Hernandez <ahdiaz@gmail.com>
 * @license MIT
 */

var fs      = require('fs'),
    path    = require('path'),
    myArgs  = require('optimist').argv,
    extend  = require('util')._extend,
    debug   = require('debug')('metalsmith-ssgs')
    ssgs    = require('./ssgs.js');

const ENV = process.env.NODE_ENV || 'local';

function getConfig() {

    const envFile = myArgs.config ? myArgs.config : `./ssgs.${ENV}.json`;

    var config = ssgs.getDefaultConfig();

    if (fs.existsSync(envFile)) {
        var fileConfig = require(path.resolve(envFile));
        config = extend(config, fileConfig);
    }

    config = extend(config, myArgs);
    config.partials = config.layouts + '/partials';

    console.log(config);

    return config;
}

function getMetadata() {
    var metadataFile = myArgs.metadata;
    if (!fs.existsSync(metadataFile)) {
        metadataFile = './metadata.json';
        if (!fs.existsSync(metadataFile)) {
            return {};
        }
    }
    return require(path.resolve(metadataFile));
}

function build(args) {
    if (args) {
        myArgs = args;
    }
    var config = getConfig();
    var metadata = getMetadata();
    ssgs.build(config, metadata);
}

module.exports = build;

if (require.main === module) {
    build();
}
