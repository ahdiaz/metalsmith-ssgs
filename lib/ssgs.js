/**
 * metalsmith-ssgs
 * Static site generator
 *
 * @author Antonio Hernandez <ahdiaz@gmail.com>
 * @license MIT
 */

var Metalsmith  = require('metalsmith'),
    define      = require('metalsmith-define'),
    markdown    = require('metalsmith-markdown'),
    layouts     = require('metalsmith-layouts'),
    collections = require('metalsmith-collections'),
    permalinks  = require('metalsmith-permalinks'),
    excerpts    = require('metalsmith-better-excerpts'),
    tags        = require('metalsmith-tags'),
    rewrite     = require('metalsmith-rewrite'),
    stylus      = require('metalsmith-stylus'),
    serve       = require('metalsmith-serve'),
    watch       = require('metalsmith-watch'),
    msIf        = require('metalsmith-if'),
    minifier    = require('metalsmith-html-minifier');
    Handlebars  = require('handlebars'),
    path        = require('path'),
    extend      = require('util')._extend,
    debug       = require('debug')('metalsmith-ssgs'),
    bundles     = require('metalsmith-bundles').bundles,
    hbtbundles  = require('metalsmith-bundles').registerBundles(Handlebars),
    drafts      = require('metalsmith-excludes'),
    hbtmd       = require('metalsmith-hbt-md'),
    helpers     = require('./helpers.js');


var errCb = function (err) {
    if (err) {
        // debug(err);
        console.log(err);
    }
};

var getDefaultConfig = function() {
    return {
        server   : false,
        host     : '0.0.0.0',
        port     : 9000,
        watch    : false,
        compress : false,
        base_url : '//localhost',
        source   : './src',
        layouts  : './templates',
        partials : './templates/partials',
        bundles  : './bundles',
        output   : './public',
        exclude  : [ 'draft', 'sandbox' ]
    };
}

var build = function(config, metadata) {

    extend(getDefaultConfig(), config);
    helpers.registerPartials(config.partials);
    helpers.registerHelpers(Handlebars);

    Metalsmith(path.dirname(config.source))

        .source(config.source)
        .destination(config.output)

        .use(define({
            production: process.env.NODE_ENV === 'production',
            metadata: metadata || {},
            config: config
        }))

        // Exclude drafts and possibly other content by tag
        .use(drafts(config.exclude))

        // Analyze and parse bundles content
        .use(bundles({
            directory: config.bundles
        }))

        // Parse tags and generate tag pages
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
            slug: { mode: 'rfc3986' }
        }))

        // Group content in collections
        .use(collections({
            pages: {
                pattern: 'pages/**/*.md'
            },
            posts: {
                pattern: 'posts/**/*.md',
                sortBy: 'date',
                reverse: true
            },
            projects: {
                pattern: 'projects/**/*.md',
                sortBy: 'weight'
            },
            sandbox: {
                pattern: 'sandbox/**/*.md',
                sortBy: 'weight'
            },
            errors: {
                pattern: 'http-errors/*.md'
            },
            assets: {
                pattern: 'assets/**/*.*'
            }
        }))

        // Create the final structure
        .use(permalinks({

            indexFile: 'index.md',

            selectors: [
                '**/*.html',
                '**/*.md'
            ],

            linksets: [{
                match: { collection: 'pages' },
                pattern: ':basename'
            },
            {
                match: { collection: 'projects' },
                pattern: ':basename'
            },
            {
                match: { collection: 'sandbox' },
                pattern: 'sandbox/:title'
            },
            {
                match: { collection: 'posts' },
                pattern: 'blog/:date/:title',
                date: 'YYYY/MM'
            }]
        }))

        // Apply Handlebars in markdown files before
        // converting them to HTML
        .use(hbtmd(Handlebars, {
            pattern: '**/*.md'
        }))

        // Now process all the markdown and generate HTML
        .use(markdown())

        // Excerpts are extracted from the first HTML paragraph
        .use(excerpts({
            pruneLength: 0
        }))

        // Apply the layouts using Handlebars
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

        // Process CSS files
        .use(stylus({
            // Set stylus output to compressed
            compress: config.compress,
            // Inline images as base64
            define: {
                //url: stylus.url()
            }
        }))

        // Minimize HTML
        .use(msIf(
            config.compress,
            minifier('*.html')
        ))

        // Bring the server online and watch for changes
        .use(msIf(
            config.server,
            serve({
                host: config.host,
                port: config.port,
                verbose: true
            })))

        .use(msIf(
            config.watch,
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

        // build the site
        .build(errCb);
};

module.exports = {
    getDefaultConfig: getDefaultConfig,
    build: build
};
