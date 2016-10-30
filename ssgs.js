var fs      = require('fs'),
    path    = require('path'),
    myArgs  = require('optimist').argv,
    extend  = require('util')._extend,
    debug   = require('debug')('metalsmith-ahdiaz-ssgs')
    builder = require('./lib/builder.js');


var config = {
    server  : myArgs.server || false,
    host    : myArgs.host || '0.0.0.0',
    port    : myArgs.port || 9000,
    compress: !myArgs.nocompress,
    config  : myArgs.config || false,
    source  : myArgs.source || false,
    layouts : myArgs.layouts || false,
    bundles : myArgs.bundles || false,
    output  : myArgs.output || false
};

var directories = (function () {

    var c = {
        source: false,
        layouts: false,
        bundles: false,
        output: false
    };

    if (fs.existsSync(config.config)) {
        var fc = require(path.resolve(config.config));
        extend(c, fc);
    }

    c.source = config.source || c.source;
    c.layouts = config.layouts || c.layouts;
    c.bundles = config.bundles || c.bundles;
    c.output = config.output || c.output;
    c.partials = c.layouts + '/partials';

    extend(config, c);
})();


var errors = [];
var stats;

try {
    stats = fs.statSync(config.source);
    if (!stats.isDirectory()) {
        throw '';
    }
} catch (e) {
    errors.push('The source directory was not found: ' + config.source);
}

try {

    stats = fs.statSync(config.layouts);

    if (!stats.isDirectory()) {
        throw '';
    }

    try {
        stats = fs.statSync(config.partials);
        if (!stats.isDirectory()) {
            throw '';
        }
    } catch (e) {
        errors.push('The partials directory was not found: ' + config.partials);
    }

} catch (e) {
    errors.push('The layouts directory was not found: ' + config.layouts);
}

try {
    stats = fs.statSync(config.bundles);
    if (!stats.isDirectory()) {
        debug('NOTICE: The bundles directory was not found: %s', config.bundles);
        config.bundles = null;
    }
} catch (e) {
    debug('NOTICE: The bundles directory was not found: %s', config.bundles);
    config.bundles = null;
}

try {
    stats = fs.statSync(config.output);
    if (stats.isDirectory()) {
        debug('WARNING: The output directory already exists: %s', config.output);
    }
} catch (e) {}

if (errors.length > 0) {
    errors.forEach(function (err) {
        debug(err);
    });
    process.exit(1);
}

builder.build(config);
