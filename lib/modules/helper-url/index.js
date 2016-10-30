var Handlebars  = require('handlebars');

Handlebars.registerHelper('url', function() {

    var ENV = process.env.ENV || 'devel';
    var parts = [];
    var options = null;
    var args = Array.prototype.slice.call(arguments);

    while (args.length > 0) {
        var item = args.shift();
        if (args.length > 0) {
            parts.push(item);
        } else {
            options = item;
        }
    }

    var url = parts.join('');
    var baseUrl = options.data.root.globals.site.url[ENV].replace(/\/$/, '');
    var parsedUrl = ('/' + Handlebars.escapeExpression(url)).replace(/(\/){2,}/g, '$1');
    parsedUrl = baseUrl + parsedUrl;

    if (parsedUrl !== url) {
        Handlebars.log(Handlebars.logger.INFO, url + ' -> ' + parsedUrl);
    }

    return new Handlebars.SafeString(parsedUrl);
});
