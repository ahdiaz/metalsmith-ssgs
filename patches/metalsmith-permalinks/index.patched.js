
var debug = require('debug')('metalsmith-permalinks');
var moment = require('moment');
var path = require('path');
var slug = require('slug-component');
var substitute = require('substitute');
var utils = require('./utils');

var basename = path.basename;
var dirname = path.dirname;
var extname = path.extname;
var join = path.join;

var find = utils.arrayFind;
var merge = utils.objectMerge;

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Metalsmith plugin that renames files so that they're permalinked properly
 * for a static site, aka that `about.html` becomes `about/index.html`.
 *
 * @param {Object} options
 *   @property {String} pattern
 *   @property {String or Function} date
 * @return {Function}
 */

function plugin(options){
  options = normalize(options);

  var linksets          = options.linksets;
  var defaultLinkset    = find(linksets, function(ls) { return !!ls.isDefault; });

  if (!defaultLinkset) {
    defaultLinkset = { 
        pattern : options.pattern,
        relative: options.relative,
        date    : options.date
    };
  }

  function findLinkset(file) {
    var set = find(linksets, function(ls) { 
        return Object.keys(ls.match).reduce(function(sofar, key) {
            if (!sofar) { return sofar; }

            if (file[key] === ls.match[key]) { return true; }
            if (file[key] && file[key].indexOf) {
                return file[key].indexOf(ls.match[key]) > -1;
            }

            return false;
        }, true);
    });

    return set || defaultLinkset;
  }

  return function(files, metalsmith, done){
    setImmediate(done);
    Object.keys(files).forEach(function(file){
      var data = files[file];
      debug('checking file: %s', file);

      if (!match(file, options.selectors)) return;
      if (data['permalink'] === false) return;

      var linkset = merge({}, findLinkset(data), defaultLinkset);
      debug('applying pattern: %s to file: %s', linkset.pattern, file);

      // Now `:basename` can be used as pattern in a linkset
      data.basename = path.basename(file, path.extname(file));

      var parsedPath = replace(linkset.pattern, data, linkset) || resolve(file);
      var sibs = siblings(file, files, options.selectors);

      // Copy assets along with the index file
      for (var key in sibs) {
        var sibpath = replace(linkset.pattern, data, linkset) + '/' + basename(key);
        delete files[key];
        files[sibpath] = sibs[key];
      }

      // add to path data for use in links in templates
      data.path = '.' == parsedPath ? '' : parsedPath;

      var out = join(parsedPath, options.indexFile || 'index.html');
      delete files[file];
      files[out] = data;
    });
  };
}

/**
 * Normalize an options argument.
 *
 * @param {String or Object} options
 * @return {Object}
 */

function normalize(options){
  if ('string' == typeof options) options = { pattern: options };
  options = options || {};
  options.date = typeof options.date === 'string' ? format(options.date) : format('YYYY/MM/DD');
  options.linksets = options.linksets || [];
  options.linksets = options.linksets.map(function(linkset) {
    if (linkset.date && typeof(linkset.date === 'string'))
      linkset.date = format(linkset.date);
    return(linkset);
  });
  options.selectors = options.selectors || ['**/*.html'];
  return options;
}

/**
 * Return a formatter for a given moment.js format `string`.
 *
 * @param {String} string
 * @return {Function}
 */

function format(string){
  return function(date){
    return moment(date).utc().format(string);
  };
}

/**
 * Get a list of sibling files for a given `file` in `files`.
 *
 * @param {String} file
 * @param {Object} files
 * @return {Object}
 */

function siblings(file, files, patterns) {
  var dir = dirname(file);
  var ret = {};

  if ('.' == dir) dir = '';

  for (var key in files) {
    if (key == file) continue;
    if (key.indexOf(dir) != 0) continue;
    if (match(key, patterns)) continue;
    var rel = key.slice(dir.length);
    var keydir = dirname(key);
    if (dir.indexOf(keydir) != 0) continue;
    ret[key] = files[key];
  }

  return ret;
}

/**
 * Resolve a permalink path string from an existing file `path`.
 *
 * @param {String} path
 * @return {String}
 */

function resolve(path){
  var ret = dirname(path);
  var base = basename(path, extname(path));
  if (base != 'index') ret = join(ret, base).replace('\\', '/');
  return ret;
}

/**
 * Replace a `pattern` with a file's `data`.
 *
 * @param {String} pattern (optional)
 * @param {Object} data
 * @param {Object} options
 * @return {String or Null}
 */

function replace(pattern, data, options){
  if (!pattern) return null;
  var keys = params(pattern);
  var ret = {};

  for (var i = 0, key; key = keys[i++];) {
    var val = data[key];
    if (val == null) return null;
    if (val instanceof Date) {
      ret[key] = options.date(val);
    } else {
      ret[key] = slug(val.toString());
    }
  }

  return substitute(pattern, ret);
}

/**
 * Get the params from a `pattern` string.
 *
 * @param {String} pattern
 * @return {Array}
 */

function params(pattern){
  var matcher = /:(\w+)/g;
  var ret = [];
  var m;
  while (m = matcher.exec(pattern)) ret.push(m[1]);
  return ret;
}

/**
 * Check whether a file has to be processed.
 *
 * @param {String} path
 * @param {Array} patterns
 * @return {Boolean}
 */

function match(path, patterns) {
  var match = require('multimatch');
  for (var i = 0; i < patterns.length; i++) {
    if (match(path, patterns[i]).length > 0) {
      return true;
    }
  }
  return false;
}
