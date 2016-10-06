
// docker run --rm -it --name ssgs-test-5 -v /Users/ahernandez/dev/euler/metalsmith-ssgs:/ssgs -v /Users/ahernandez/dev/euler/ahdiaz.euler.es:/www -w /ssgs -p 9000:9000 node:5.9.1-wheezy bash

var Metalsmith  = require('metalsmith'),
    metadata    = require('metalsmith-metadata'),
    markdown    = require('metalsmith-markdown'),
    layouts     = require('metalsmith-layouts'),
    collections = require('metalsmith-collections'),
    permalinks  = require('metalsmith-permalinks'),
    excerpts    = require('metalsmith-better-excerpts'),
    tags        = require('metalsmith-tags'),
    rewrite     = require('metalsmith-rewrite'),
    stylus      = require('metalsmith-stylus'),
    drafts      = require('metalsmith-drafts'),
    serve       = require('metalsmith-serve'),
    watch       = require('metalsmith-watch'),
    msIf        = require('metalsmith-if'),
    chalk       = require('chalk'),
    Handlebars  = require('handlebars'),
    fs          = require('fs'),
    path        = require('path'),
    myArgs      = require('optimist').argv;


var ENV_PROD  = 'prod',
    ENV_DEVEL = 'devel',
    ENV       = process.env.ENV || ENV_DEVEL;

var options = {
    server  : myArgs.server || false,
    host    : myArgs.host || '0.0.0.0',
    port    : myArgs.port || 9000,
    compress: !myArgs.nocompress,
    config  : myArgs.config || false,
    source  : myArgs.source || false,
    layouts : myArgs.layouts || false,
    output  : myArgs.output || false
};

var log = function (tag, message, timestamp) {

    function formatNumber(num) {
        return num < 10 ? '0' + num : num;
    }

    tag = chalk.blue('  ' + (tag || 'undefined'));
    var tstamp = ' ';

    if (timestamp) {
        var date = new Date();
        tstamp = formatNumber(date.getHours()) + ':' + formatNumber(date.getMinutes()) + ':' + formatNumber(date.getSeconds());
        tstamp = ' [' + tstamp + '] ';
    }

    console.log(tag + tstamp + message);
}

var config = (function () {

    var extend = require('util')._extend;
    var c = {
        source: false,
        layouts: false,
        output: false
    };

    if (fs.existsSync(options.config)) {
        var config = require(path.resolve(options.config));
        extend(c,  config);
    }

    c.source = options.source || c.source;
    c.layouts = options.layouts || c.layouts;
    c.output = options.output || c.output;

    return c;
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
} catch (e) {
    errors.push('The layouts directory was not found: ' + config.layouts);
}

try {
    stats = fs.statSync(config.output);
    if (stats.isDirectory()) {
        log('metalsmith-ssgs', 'WARNING: The output directory already exists: ' + config.output);
    }
} catch (e) {}

if (errors.length > 0) {
    errors.forEach(function (err) {
        log('metalsmith-ssgs', err);
    });
    process.exit(1);
}

var errCb = function (err) {
    if (err) {
        console.log(err);
    }
};

fs.readdir(config.layouts + '/partials/', function (error, files) {
    for (var i = 0, l = files.length; i < l; i++) {
        var file = files[i];
        var partial = file.replace(/\.[^/.]+$/, '');
        Handlebars.registerPartial(partial, fs.readFileSync(config.layouts + '/partials/' + file).toString());
    }
});


var addFileProperties = function(files, metalsmith, done){
    for (var key in files) {
        files[key].path = key;
        files[key].extension = path.extname(key);
        files[key].basename = path.basename(key, path.extname(key));
        log('metalsmith-fileproperties', 'Updated properties for ' + key);
    }
    done();
};

var debugFiles = function(options) {
    return function(files, metalsmith, done){
        for (var key in files) {
            if (options.keys) {
                console.log(key);
            } else {
                console.log(files[key]);
            }
        }
        console.log(metalsmith.metadata());
        done();
    };
};

Handlebars.registerHelper('url', function(url, options) {

    var baseUrl = this.globals.url[ENV].replace(/\/$/, '');
    var parsedUrl = ('/' + Handlebars.escapeExpression(url)).replace(/(\/){2,}/g, '$1');
    parsedUrl = baseUrl + parsedUrl;

    if (parsedUrl !== url) {
        log('metalsmith-url', url + ' -> ' + parsedUrl);
    }

    return new Handlebars.SafeString(parsedUrl);
});


Metalsmith(__dirname)
    .source(config.source)
    .destination(config.output)
    .use(drafts())
    .use(metadata({
        globals: 'globals.yml'
    }))
    // .use(debugFiles({
    //     keys: false
    // }))
    .use(markdown())
    .use(excerpts({
        pruneLength: 0
    }))
    .use(tags({
        //
        // TODO: Search docs for pagination
        //
        // yaml key for tag list in you pages
        handle: 'tags',
        // path for result pages
        path: 'tags/:tag.html',
        // layout to use for tag listing
        layout: config.layouts + '/tag.hbt',
        // provide posts sorted by 'date' (optional)
        sortBy: 'date',
        // sort direction (optional)
        reverse: true,
        // skip updating metalsmith's metadata object.
        // useful for improving performance on large blogs
        // (optional)
        skipMetadata: false,
        // Any options you want to pass to the [slug](https://github.com/dodo/node-slug) package.
        // Can also supply a custom slug function.
        // slug: function(tag) { return tag.toLowerCase() }
        slug: {mode: 'rfc3986'}
    }))
    .use(collections({
        pages: {
            pattern: 'pages/*.html'
        },
        posts: {
            pattern: 'posts/*.html',
            sortBy: 'date',
            reverse: true
        },
        errors: {
            pattern: 'http-errors/*.html'
        },
    }))
    .use(addFileProperties)
    .use(permalinks({

        //pattern: ':title',
        // relative: false,

        linksets: [{
            match: { collection: 'posts' },
            pattern: 'blog/:date/:title',
            // date: function () { return 'mmddyy'; }
        }, {
            match: { collection: 'pages' },
            pattern: ':basename'
        }]
    }))
    .use(rewrite([{
        pattern: 'http-errors/*.html',
        filename: 'http-errors/{path.name}.php'
    }]))
    .use(layouts({
        engine: 'handlebars',
        // default: 'page.hbt',
        directory: config.layouts,
        partials: config.layouts + '/partials',
        // pattern: '*.hbt',
    }))
    .use(stylus({
        // Set stylus output to compressed
        compress: options.compress,
        // Inline images as base64
        define: {
            //url: stylus.url()
        }
    }))
    .use(msIf(
        options.server,
        serve({
            host: options.host,
            port: options.port,
            verbose: true
        })))
    .use(msIf(
        options.server,
        watch({
            // paths: {
            //     '${source}/**/*': true,
            //     //config.templates + '/**/*': true,
            // },
            paths: (function () {
                var ret = {};
                ret['${source}/**/*'] = true;
                ret[config.layouts + '/**/*'] = '**/*.md';
                return ret;
            })(),
            livereload: options.server
        })))
    .build(errCb);
