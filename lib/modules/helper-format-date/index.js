var Handlebars  = require('handlebars'),
    moment      = require('moment');

Handlebars.registerHelper('formatDate', function (date, format) {
    var mmnt = moment(date);
    return mmnt.format(format);
});
