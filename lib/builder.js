/**
 * metalsmith-ssgs
 * Static site generator
 *
 * @author Antonio Hernandez <ahdiaz@gmail.com>
 * @license MIT
 */

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
    serve       = require('metalsmith-serve'),
    watch       = require('metalsmith-watch'),
    msIf        = require('metalsmith-if'),
    minifier    = require('metalsmith-html-minifier');
    Handlebars  = require('handlebars'),
    fs          = require('fs'),
    path        = require('path'),
    extend      = require('util')._extend,
    debug       = require('debug')('metalsmith-ahdiaz-ssgs'),
    bundles     = require('metalsmith-bundles'),
    drafts      = require('metalsmith-excludes'),
    hbtmd       = require('metalsmith-hbt-md'),
    hbtbundles  = require('handlebars-helper-bundles')(Handlebars),
    hbtdate     = require('handlebars-helper-formatdate')(Handlebars),
    hbturl      = require('handlebars-helper-url')(Handlebars);


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
};

/**
 * The {{#istaglist}} helper checks if a variable is defined.
 * Don't know why but the tag list is preserved from one document and another
 * and if the page has no tags the property tags still has a value.
 */
var helperIsTagList = function(Handlebars) {
    Handlebars.registerHelper('isTagList', function(variable, options) {
        var areTags = false;
        if (typeof variable !== 'undefined' && typeof variable.slice == 'function') {
            areTags = true;
            variable.forEach(function (tag) {
                if (typeof tag !== 'string') {
                    areTags = false;
                }
            });
        }
        if (areTags) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    return Handlebars;
};

var helperHasTag = function(Handlebars) {
    Handlebars.registerHelper('hasTag', function(tagname, options) {
        var hasTag = false;
        if (this['tags'] !== undefined && typeof this.tags['slice'] == 'function') {
            this.tags.forEach(function (tag) {
                if (tag === tagname) {
                    hasTag = true;
                }
            });
        }
        if (hasTag) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    return Handlebars;
};

var dd = function () {
    return function (files, metalsmith, done) {
        Object.keys(files).forEach(function (file) {
            console.log(files[file]);
        });
        done();
    };
};

var defaultConfig = {
    server   : false,
    host     : '0.0.0.0',
    port     : 9000,
    watch    : false,
    compress : false,
    domain   : '/',
    source   : false,
    layouts  : false,
    partials : false,
    bundles  : false,
    output   : false,
    exclude  : [ 'draft', 'sandbox' ]
};

var build = function (config) {

    extend(defaultConfig, config);
    registerPartials(config.partials);
    Handlebars = helperIsTagList(Handlebars);
    Handlebars = helperHasTag(Handlebars);

    Metalsmith(path.dirname(config.source))

        .source(config.source)
        .destination(config.output)

        // Exclude drafts and possibly other content by tag
        .use(drafts(config.exclude))

        // Include global metadata
        .use(metadata({
            globals: 'globals.yml'
        }))

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

module.exports = build;
