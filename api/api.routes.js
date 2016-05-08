module.exports = function (server) {
    var controller = require("./api.controller.js");

    server.get('tickers/:codeCsv', controller.getTickerHeaders);
    server.get(':code/chartData', controller.getHistorical);
};