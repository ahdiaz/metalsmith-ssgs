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
    permalinks  = require('@metalsmith/permalinks'),
    excerpts    = require('metalsmith-better-excerpts'),
    tags        = require('metalsmith-tags'),
    rewrite     = require('metalsmith-rewrite'),
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
        console.log(err);
    }
};

var getDefaultConfig = function() {
    return {
        server       : false,
        host         : '0.0.0.0',
        port         : 9000,
        watch        : false,
        compress     : false,
        baseUrl      : '//localhost',
        source       : './src',
        layouts      : './layouts',
        defaultLayout: 'main.hbs',
        tagsLayout   : 'tags.hbs',
        partials     : './layouts/partials',
        bundles      : './bundles',
        output       : './public',
        exclude      : [],
        plugins      : {

            collections: {},

            permalinks: {
                indexFile: 'index.html',
                relative: false
            }
        }
    };
}

var build = function(config, metadata) {

    extend(getDefaultConfig(), config);
    helpers.registerPartials(config.partials);
    helpers.registerHelpers(Handlebars);

    Metalsmith(path.dirname(config.source))

        .source(config.source)
        .destination(config.output)

        // Define custom values in the metadata
        .use(define({
            env: process.env.NODE_ENV || 'local',
            config: config,
            metadata: metadata || {}
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
            layout: config.tagsLayout,
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

        // Apply Handlebars in markdown files before converting them to HTML
        .use(hbtmd(Handlebars, {
            pattern: '**/*.md'
        }))

        // Now process all the markdown and generate HTML
        .use(markdown())

        // Group content in collections
        .use(collections(config.plugins.collections))

        // Append the key `filebasename` to the file metadata
        // so we can use the key `:filebasename` in patterns of the
        // permalinks plugin.
        .use(function (files, metalsmith, done) {
            Object.keys(files).forEach(function (filepath) {
                const bn = path.basename(filepath, path.extname(filepath));
                files[filepath].filebasename = bn;
            });
            done();
        })

        // Create the final structure
        .use(permalinks(config.plugins.permalinks))

        // The layouts plugin is very sensible about extensions...
        .use(rewrite({
            pattern: '**/*.html',
            filename: '{path.dir}/{path.name}.hbs',
        }))

        // Apply the layouts using Handlebars
        .use(layouts({
            default: config.defaultLayout,
            directory: config.layouts,
            pattern: [
                '**/*.hbs',
                '**/*.php',
            ],

            // Setting this option to true will disable the auto-indent feature.
            // <pre/> tags have issues with indentation, code blocks for example.
            preventIndent: true
        }))

        // Take back the html extension
        .use(rewrite({
            pattern: '**/*.hbs',
            filename: '{path.dir}/{path.name}.html',
        }))

        // Excerpts are extracted from the first HTML paragraph
        .use(excerpts({
            pruneLength: 0
        }))

        // Minimize HTML
        .use(msIf(
            config.compress,
            minifier({
                pattern: [ '**/*.html', '**/*.css' , '**/*.js' ],
                minifierOptions: {
                    removeComments: true,
                    minifyCSS: true,
                    minifyJS: true,
                }
            })
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
                //     //config.layouts + '/**/*': true,
                // },
                paths: (function () {
                    var ret = {};
                    ret[config.source + '/**/*'] = '**/*.md';
                    ret[config.layouts + '/**/*'] = '**/*.hbs';
                    ret[config.bundles + '/**/*'] = '**/*.html';
                    ret[config.bundles + '/**/*'] = '**/*.php';
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
