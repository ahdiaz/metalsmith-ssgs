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

var addFileProperties = function (options) {
    return function (files, metalsmith, done) {
        for (var key in files) {
            files[key].path = key;
            files[key].extension = path.extname(key);
            files[key].basename = path.basename(key, path.extname(key));
            log('metalsmith-fileproperties', 'Updated properties for ' + key);
        }
        done();
    };
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

var hbtmd = function (options) {

    var match = require('multimatch');
    options = options || {};

    return function (files, metalsmith, done) {

        setImmediate(done);
        var meta = metalsmith.metadata();

        Object.keys(files).forEach(function (key) {

            if (match(key, options.pattern).length === 0) {
                return;
            }

            var file = files[key];
            var source = file.contents.toString();
            var template = Handlebars.compile(source, options);
            var data = Object.assign({}, meta, file);

            try {
                file.contents = new Buffer(template(data));
            } catch (e) {
                log('metalsmith-hbtmd', e.message);
            }
        });
    };
};

var bundles = function (options) {

    options = Object.assign({
            directory: null,
            extension: 'html'
        },
        (options || {})
    );

    return function (files, metalsmith, done) {

        setImmediate(done);
        var meta = metalsmith.metadata();

        Object.keys(files).forEach(function (key) {

            var data = files[key];
            if (!data.bundles) {
                return;
            }

            data.bundles.forEach(function (bundle) {

                var stats = null;

                try {
                    stats = fs.statSync(options.directory);
                    if (!stats.isDirectory()) {
                        throw 'Bundle directory not found: ' + options.directory;
                    }
                } catch (e) {
                    log('metalsmith-bundles', 'Bundle directory not found: ' + options.directory);
                    return;
                }

                try {

                    var head = new Buffer('');
                    var page = new Buffer('');
                    var footer = new Buffer('');
                    var path = null;
                    var bundlePath = options.directory + '/' + bundle;

                    stats = fs.statSync(bundlePath);
                    if (!stats.isDirectory()) {
                        throw 'Bundle path not found';
                    }

                    try {
                        path = bundlePath + '/head.' + options.extension;
                        stats = fs.statSync(path);
                        if (stats.isFile()) {
                            head = fs.readFileSync(path);
                        }
                    } catch (e) {
                        log('metalsmith-bundles', 'No head component for ' + key);
                    }

                    try {
                        path = bundlePath + '/page.' + options.extension;
                        stats = fs.statSync(path);
                        if (stats.isFile()) {
                            page = fs.readFileSync(path);
                        }
                    } catch (e) {
                        log('metalsmith-bundles',  'No page component for ' + key);
                    }

                    try {
                        path = bundlePath + '/footer.' + options.extension;
                        stats = fs.statSync(path);
                        if (stats.isFile()) {
                            footer = fs.readFileSync(path);
                        }
                    } catch (e) {
                        log('metalsmith-bundles',  'No footer component for ' + key);
                    }

                    files[key].bundlesData = files[key].bundlesData || {
                        head: new Buffer(''),
                        page: new Buffer(''),
                        footer: new Buffer('')
                    };

                    files[key].bundlesData.head = Buffer.concat([files[key].bundlesData.head, head]);
                    files[key].bundlesData.page = Buffer.concat([files[key].bundlesData.page, page]);
                    files[key].bundlesData.footer = Buffer.concat([files[key].bundlesData.footer, footer]);

                } catch (e) {
                    log('metalsmith-bundles', e.message);
                }
            });

            log('metalsmith-bundles', key + ' processed');
        });
    };
};

Handlebars.registerHelper('bundles', function (section, options) {
    var ret = null;
    try {
        var data = options.data.root.bundlesData[section];
        ret = new Handlebars.SafeString(data);
    } catch (e) {
        ret = new Buffer('');
    }
    return ret;
});

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
        .use(bundles({
            directory: config.bundles
        }))
        .use(hbtmd({
            pattern: '**/*.md'
        }))
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
        .use(addFileProperties())
        .use(permalinks({

            //pattern: ':title',
            // relative: false,

            linksets: [{
                match: { collection: 'posts' },
                pattern: 'blog/:date/:title',
                date: 'YYYY/MM'
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
            ],

            // Setting this option to true will disable the auto-indent feature.
            // <pre/> tags have issues with indentation, code blocks for example.
            preventIndent: true
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
                    ret[config.source + '/**/*'] = '**/*.md';
                    ret[config.layouts + '/**/*'] = '**/*.hbt';
                    ret[config.bundles + '/**/*'] = '**/*.html';
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
