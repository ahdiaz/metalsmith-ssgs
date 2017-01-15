/**
 * metalsmith-ssgs
 * Static site generator
 *
 * @author Antonio Hernandez <ahdiaz@gmail.com>
 * @license MIT
 */

var applyPatch = require('apply-patch').applyPatch,
    debug      = require('debug')('ssgs-patch');

// List all files in a directory in Node.js recursively in a synchronous fashion
var walkSync = function(dir, filelist) {

  var path = path || require('path');
  var fs = fs || require('fs'),
      files = fs.readdirSync(dir);

  filelist = filelist || [];

  files.forEach(function(file) {

    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    } else {
      if (/\.patch$/.test(file)) {
        filelist.push(path.join(dir, file));
      }
    }
  });

  return filelist;
};

walkSync('./patches').forEach(function (patch) {
  try {
    debug('Applying patch: %s', patch);
    applyPatch(patch);
  } catch (e) {
    debug(e.message);
    // process.exit(1);
  }
});
