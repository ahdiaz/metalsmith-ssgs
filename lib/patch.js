/**
 * metalsmith-ssgs
 * Static site generator
 *
 * @author Antonio Hernandez <ahdiaz@gmail.com>
 * @license MIT
 */

var applyPatch = require('apply-patch').applyPatch;
var path = require('path');
var fs = require('fs');

// List all files in a directory in Node.js recursively in a synchronous fashion
var walkSync = function(dir, filelist) {

  filelist = filelist || [];

  if (!fs.existsSync(dir)) {
    return filelist;
  }

  var files = fs.readdirSync(dir);

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
    console.log('Applying patch: %s', patch);
    applyPatch(patch);
  } catch (e) {
    console.log(e.message);
    // process.exit(1);
  }
});
