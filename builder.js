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
    moment      = require('moment'),
    Handlebars  = require('handlebars'),
    fs          = require('fs'),
    path        = require('path');



var ENV_PROD  = 'prod',
    ENV_DEVEL = 'devel',
    ENV       = process.env.ENV || ENV_DEVEL;

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

var errCb = function (err) {
    if (err) {
        console.log(err);
    }
};

var registerPartials = function (partials) {
    fs.readdir(partials, function (error, files) {
        for (var i = 0, l = files.length; i < l; i++) {
            var file = files[i];
            var partial = file.replace(/\.[^/.]+$/, '');
            Handlebars.registerPartial(partial, fs.readFileSync(partials + '/' + file).toString());
        }
    });
}

var addFileProperties = function (files, metalsmith, done){
    for (var key in files) {
        files[key].path = key;
        files[key].extension = path.extname(key);
        files[key].basename = path.basename(key, path.extname(key));
        log('metalsmith-fileproperties', 'Updated properties for ' + key);
    }
    done();
};

var debugFiles = function (options) {
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

Handlebars.registerHelper('url', function() {

    var parts = [];
    var options = null;
    var args = Array.prototype.slice.call(arguments);

    while (args.length > 0) {
        var item = args.shift();
        if (args.length > 0) {
            parts.push(item);
        } else {
            options = item;
        }
    }

    var url = parts.join('');
    var baseUrl = options.data.root.globals.site.url[ENV].replace(/\/$/, '');
    var parsedUrl = ('/' + Handlebars.escapeExpression(url)).replace(/(\/){2,}/g, '$1');
    parsedUrl = baseUrl + parsedUrl;

    if (parsedUrl !== url) {
        log('metalsmith-url', url + ' -> ' + parsedUrl);
    }

    return new Handlebars.SafeString(parsedUrl);
});

Handlebars.registerHelper('formatDate', function (date, format) {
    var mmnt = moment(date);
    return mmnt.format(format);
});

var build = function (config) {

    registerPartials(config.partials);

    Metalsmith(path.dirname(config.source))
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
            layout: config.layouts + '/tags.hbt',
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
            default: 'main.hbt',
            directory: config.layouts,
            partials: config.partials,
            pattern: [
                '**/*.html',
                '**/*.php',
            ]
        }))
        .use(stylus({
            // Set stylus output to compressed
            compress: config.compress,
            // Inline images as base64
            define: {
                //url: stylus.url()
            }
        }))
        .use(msIf(
            config.server,
            serve({
                host: config.host,
                port: config.port,
                verbose: true
            })))
        .use(msIf(
            config.server,
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
                livereload: config.server
            })))
        .build(errCb);
};

module.exports = {

    log: log,

    build: build
};
