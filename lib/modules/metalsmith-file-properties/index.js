var path  = require('path'),
    debug = require('debug')('metalsmith-file-properties');

module.exports = function (options) {
    return function (files, metalsmith, done) {
        for (var key in files) {
            files[key].path = key;
            files[key].extension = path.extname(key);
            files[key].basename = path.basename(key, path.extname(key));
            debug('Updated properties for %s', key);
        }
        done();
    };
};
