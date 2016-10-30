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
    minifier    = require('metalsmith-html-minifier');
    Handlebars  = require('handlebars'),
    fs          = require('fs'),
    path        = require('path'),
    debug       = require('debug')('metalsmith-ahdiaz-ssgs'),
    bundles     = require('./modules/metalsmith-bundles'),
    hbtbundles  = require('./modules/helper-bundles'),
    fileprop    = require('./modules/metalsmith-file-properties'),
    hbtmd       = require('./modules/metalsmith-hbt-md'),
    hbtdate     = require('./modules/helper-format-date'),
    hbturl      = require('./modules/helper-url');



var ENV_PROD  = 'prod',
    ENV_DEVEL = 'devel',
    ENV       = process.env.ENV || ENV_DEVEL;


var errCb = function (err) {
    if (err) {
        debug(err);
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

Handlebars.registerHelper('assets', function(res, options) {
    // console.log(arguments);
    // console.log(options);
});

var build = function (config) {

    registerPartials(config.partials);

    Metalsmith(path.dirname(config.source))
        .source(config.source)
        .destination(config.output)
        .use(msIf(
            ENV === ENV_PROD,
            drafts()
        ))
        .use(metadata({
            globals: 'globals.yml'
        }))
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
        .use(fileprop())
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
            ENV === ENV_PROD,
            minifier('*.html')
        ))
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

    build: build
};
