/**
 * metalsmith-ssgs
 * Static site generator
 *
 * @author Antonio Hernandez <ahdiaz@gmail.com>
 * @license MIT
 */

var fs = require('fs');

/**
 * The {{#istaglist}} helper checks if a variable is defined.
 * Don't know why but the tag list is preserved from one document and another
 * and if the page has no tags the property tags still has a value.
 */
var registerIsTagList = function(Handlebars) {
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

var registerHasTag = function(Handlebars) {
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

var registerUrl = function(Handlebars) {
    Handlebars.registerHelper('url', function() {

        var args = Array.prototype.slice.call(arguments);
        var options = args.pop();
        var url = args.join('/');

        var baseUrl = options.data.root.config.base_url.replace(/\/$/, '');
        var parsedUrl = ('/' + Handlebars.escapeExpression(url)).replace(/(\/){2,}/g, '$1');
        parsedUrl = baseUrl + parsedUrl;

        if (parsedUrl !== url) {
            Handlebars.log(Handlebars.logger.INFO, url + ' -> ' + parsedUrl);
        }

        return new Handlebars.SafeString(parsedUrl);
    });
    return Handlebars;
};

var helpers = [ registerIsTagList, registerHasTag, registerUrl ];

module.exports = {

    registerHelpers: function (Handlebars) {
        helpers.forEach(function (register) {
            Handlebars = register(Handlebars);
        });
        return Handlebars;
    },

    registerPartials: function (partials) {
        fs.readdir(partials, function (error, files) {
            for (var i = 0, l = files.length; i < l; i++) {
                var file = files[i];
                var partial = file.replace(/\.[^/.]+$/, '');
                Handlebars.registerPartial(partial, fs.readFileSync(partials + '/' + file).toString());
            }
        });
    }
};