var fs    = require('fs'),
    debug = require('debug')('metalsmith-bundles');

module.exports = function (options) {

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
                    debug('Bundle directory not found: %s', options.directory);
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
                        debug('No head component for %s', key);
                    }

                    try {
                        path = bundlePath + '/page.' + options.extension;
                        stats = fs.statSync(path);
                        if (stats.isFile()) {
                            page = fs.readFileSync(path);
                        }
                    } catch (e) {
                        debug('No page component for %s', key);
                    }

                    try {
                        path = bundlePath + '/footer.' + options.extension;
                        stats = fs.statSync(path);
                        if (stats.isFile()) {
                            footer = fs.readFileSync(path);
                        }
                    } catch (e) {
                        debug('No footer component for %s', key);
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
                    debug(e.message);
                }
            });

            debug('%s processed', key);
        });
    };
};
