var request = require("request");
var _ = require("lodash");
var moment = require("moment");
var Converter = require("csvtojson").Converter;

exports.getTickerHeaders = function (req, res, next) {

    if(!req.params.codeCsv){
        res.send(400, "At least one comma-separated code must be supplied");
        return next();
    }

    request('http://finance.yahoo.com/d/quotes.csv?s=' + _.join(req.params.codeCsv.split(","), '+') + '&f=sn', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var tickers = [];

            var converter = new Converter({noheader: true});
            converter.fromString(body, function(err, result){
                _.forEach(result, function(ticker){
                    tickers.push(new Ticker(ticker));
                });

                res.send(tickers);
            });
        }
        else {
            res.send(response.statusCode || 500, error);
        }
        return next();
    })
};

exports.getHistorical = function (req, res, next) {
    request('https://www.google.com/finance/historical?q=' + req.params.code + '&output=csv', function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var ohlc = [];
            var volume = [];

            var converter = new Converter({});
            converter.fromString(body, function (err, result) {

                _.forEach(result, function(entry){
                    ohlc.push(new OHLCEntry(entry));
                    volume.push(new VolumeEntry(entry));
                });

                res.send( {
                    ohlc: _.sortBy(ohlc, "date"),
                    volume: _.sortBy(volume, "date")
                });
            });
        }
        else {
            res.send(response.statusCode || 500, error);
        }

        return next();
    });
};

function Ticker(ticker) {
    this.code = ticker.field1;
    this.description = ticker.field2;
}

function OHLCEntry(entry) {
    this.date = Math.floor(moment(new Date(Date.parse(entry.Date)).toISOString()).unix() / 86400);
    this.open = parseFloat(entry.Open);
    this.high = parseFloat(entry.High);
    this.low = parseFloat(entry.Low);
    this.close = parseFloat(entry.Close);
}

function VolumeEntry(entry){
    this.date = Math.floor(moment(new Date(Date.parse(entry.Date)).toISOString()).unix() / 86400);
    this.volume = parseInt(entry.Volume);
}
