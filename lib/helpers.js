/**
 * metalsmith-ssgs
 * Static site generator
 *
 * @author Antonio Hernandez <ahdiaz@gmail.com>
 * @license MIT
 */

var fs = require('fs');
var debug = require('debug')('metalsmith-ssgs');
var moment = require('moment');

/**
 * The {{#istaglist}} helper checks if a variable is defined.
 * Don't know why but the tag list is preserved from one document and another
 * and if the page has no tags the property tags still has a value.
 */
var registerIsTagList = function(Handlebars) {
    Handlebars.registerHelper('isTagList', function(variable, options) {
        var areTags = false;
        if (typeof variable !== 'undefined' && Array.isArray(variable)) {
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
        if (this['tags'] !== undefined && Array.isArray(this.tags)) {
            this.tags.forEach(function (tag) {
                if (tag.name === tagname) {
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

        var baseUrl = options.data.root.config.baseUrl.replace(/\/$/, '');
        var parsedUrl = ('/' + Handlebars.escapeExpression(url)).replace(/(\/){2,}/g, '$1');
        parsedUrl = baseUrl + parsedUrl;

        if (parsedUrl !== url) {
            Handlebars.log(Handlebars.logger.INFO, url + ' -> ' + parsedUrl);
        }

        return new Handlebars.SafeString(parsedUrl);
    });
    return Handlebars;
};

var registerDateFormatter = function(Handlebars) {
    Handlebars.registerHelper('formatDate', function (date, format) {
        var mmnt = moment(date);
        return mmnt.format(format);
    });
}


module.exports = {

    registerHelpers: function (Handlebars) {
        var helpers = [ registerIsTagList, registerHasTag, registerUrl , registerDateFormatter];
        helpers.forEach(function (register) {
            Handlebars = register(Handlebars);
        });
        return Handlebars;
    },

    registerPartials: function (partials) {
        fs.readdir(partials, function (error, files) {

            if (!files) {
                debug(`No partials found under ${partials}.`);
                return;
            }

            for (var i = 0, l = files.length; i < l; i++) {
                var file = files[i];
                var partial = file.replace(/\.[^/.]+$/, '');
                Handlebars.registerPartial(partial, fs.readFileSync(partials + '/' + file).toString());
            }
        });
    }
};