var Handlebars  = require('handlebars'),
    match       = require('multimatch'),
    debug       = require('debug')('metalsmith-hbt-md');

module.exports = function (options) {

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
                debug(e.message);
            }
        });
    };
};
