var Handlebars  = require('handlebars');

Handlebars.registerHelper('bundles', function (section, options) {
    try {
        var data = options.data.root.bundlesData[section];
    } catch (e) {
        var data = '';
    }
    var ret = new Handlebars.SafeString(data);
    return ret;
});
