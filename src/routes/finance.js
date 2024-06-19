const fs = require("fs");
const path       = require("path");
const utils = require('../utils');

const fetch = require("node-fetch");
const express = require("express");
const router = express.Router();
	
const YH_FINANCE_URL_V2 = process.env.YH_FINANCE_API_URL_V2;
const YH_MARKET_URL_V2  = process.env.YH_MARKET_API_URL_V2;

const YH_FINANCE_URL_V3 = process.env.YH_FINANCE_API_URL_V3;
const YH_MARKET_URL_V3  = process.env.YH_MARKET_API_URL_V3;

const OPTIONS =
{
    method:  "GET",
    headers: {}
};

OPTIONS.headers[process.env.API_KEY_KEY] = process.env.API_KEY_VAL;
OPTIONS.headers[process.env.API_HOST_KEY] = process.env.API_HOST_VAL;

router.post("/", function (req, response, next) 
{
});

router.get("/portfolio", function (req, response, next) 
{
    const name = req.query.q;

    const filePath = utils.getCurrentDomainFilePath(req, "portfolio.json");
    const portfolioData = require(filePath);

    response.append("Access-Control-Allow-Origin", "*");
    response.send(portfolioData);
});

async function fillOptionsPriceYahoo(portfolioData)
{

}

async function fillOptionsPriceYH_V2(portfolioData)
{
    let promises = [];
    for(let item of portfolioData)
    {
        const date = Date.parse(item.exp_date)/1000;
        const url = `${YH_FINANCE_URL_V2}/get-options?symbol=${item.symbol}&region=US&date=${date}`;
        await new Promise(r => setTimeout(r, 500));
        promises.push(fetch(url, OPTIONS).then(res => res.json()).catch(e => {}));
    }

    const optionsData = await Promise.all(promises);

    for(let i = 0; i < portfolioData.length; i++)
    {
        if(optionsData[i])
        {
            const call = optionsData[i].contracts.calls.find(item => item.strike.raw == portfolioData[i].strike);
            const price = call.ask.raw ? call.ask.raw : call.lastPrice.raw;
            // const option = optionsData[i].optionChain.result[0].options[0].straddles.find(item => item.strike == portfolioData[i].strike);
            // const price = option.call.ask ? option.call.ask : option.call.lastPrice;
            portfolioData[i]["current_call_price"] = price;    
            
            portfolioData[i]["call_price_type"] = call.ask.raw ? 'ask' : 'last price';
        }
    }
}

function getContactId(item)
{
    const date = new Date(item.exp_date);
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // add leading zero to month if needed
    const day = date.getDate().toString().padStart(2, '0'); // add leading zero to day if needed
    const dateStr = year + month + day; // combine the year, month, and day in YYMMDD format

    const strike = item.strike * 1000;
    const strikeStr = strike.toString().padStart(8, '0');
    const ret = `${item.symbol}${dateStr}C${strikeStr}`;

    return ret;
}

async function fillOptionsPriceYH_V3(portfolioData)
{
    let promises = [];
    for(let item of portfolioData)
    {
        const contractId = getContactId(item);

        const url = `${YH_FINANCE_URL_V3}/get-options?symbol=${contractId}`;
        await new Promise(r => setTimeout(r, 500));
        promises.push(fetch(url, OPTIONS).then(res => res.json()).catch(e => {}));
    }

    const optionsData = await Promise.all(promises);

    for(let i = 0; i < portfolioData.length; i++)
    {
        if(optionsData[i])
        {
            let priceType = 'ask';
            let price = 0;
            if(optionsData[i].optionChain.result.length > 0)
            {
                const quote = optionsData[i].optionChain.result[0].quote;
                price = quote.ask ? quote.ask : quote.regularMarketPrice;                    
                priceType = quote.ask ? 'ask' : 'last price';
            }

            portfolioData[i]["current_call_price"] = price;                
            portfolioData[i]["call_price_type"] = priceType;
        }
    }
}

async function getPortfolioStatus(req, res)
{
    const name = req.query.q;

    const filePath = utils.getCurrentDomainFilePath(req, "portfolio.json");
    const portfolioData = require(filePath);

    let symbols = portfolioData.reduce((acc, item) => acc + item.symbol + ',', '');

    // https://yh-finance.p.rapidapi.com/market/v2/get-quotes?region=US&symbols=AMD,IBM,
    let url   = `${YH_MARKET_URL_V2}/get-quotes?symbols=${symbols}&region=US`;
    let response = await fetch (url, OPTIONS);
    let json     = await response.json();

    for(let item of portfolioData)
    {
        const matchResult = json.quoteResponse.result.find(quote => quote.symbol == item.symbol);
        item["current_stock_price"] = matchResult.regularMarketPrice;
    }

    // await fillOptionsPriceYahoo(portfolioData);
    //await fillOptionsPriceYH_V2(portfolioData);
    await fillOptionsPriceYH_V3(portfolioData);

    return portfolioData;
}

router.get("/portfolio-status", function (req, response, next) 
{
    getPortfolioStatus(req, response)
    .then((json) => 
    {
        response.append("Access-Control-Allow-Origin", "*");
        response.send(json);
    })
    .catch((e) => 
    {
        response.append("Access-Control-Allow-Origin", "*");
        response.send("Failed to get data");            
        console.error(e);
        debugger;
    }); 
});

async function getChartData(req, res)
{
    let url   = `${YH_FINANCE_URL_V3}/get-chart?symbol=NUE&region=US&interval=1d&range=2y`;
    let response = await fetch (url, OPTIONS);
    let json     = await response.json();

    let prices = [];
    const size = json.chart.result[0].timestamp.length;
    for(let i = 2; i < size; i++) //intentionaly skip the first 2 items
    {
        const open  = json.chart.result[0].indicators.quote[0].open[i];
        const close = json.chart.result[0].indicators.quote[0].close[i];
        const yesterdayClose = json.chart.result[0].indicators.quote[0].close[i-1];
        
        const change = close - yesterdayClose;
        const percentChange = change / yesterdayClose;
        const yesterdayChange = yesterdayClose - json.chart.result[0].indicators.quote[0].close[i-2];

        const rev = (yesterdayChange == 0 || change == 0) ? 0 :
                    (yesterdayChange * change > 0)        ? 100000 * Math.abs(percentChange) : -100000 * Math.abs(percentChange);

        const date = json.chart.result[0].timestamp[i];

        const item = 
        {
            date: date,
            dateStr: new Date(date * 1000).toLocaleDateString(),
            open: open.toFixed(2),
            close: close.toFixed(2),
            change: change.toFixed(2),
            percentChange: percentChange.toFixed(4),
            revenue: rev.toFixed(2)
        };

        prices.push(item);
    }

    return prices;
}

async function getHistoricalData(req, res)
{
    // let url   = `${YH_FINANCE_URL_V3}/get-historical-data?symbol=SPY&region=US&start=2019-01-01&end=2019-02-02`;
    let url   = `${YH_FINANCE_URL_V3}/get-historical-data?symbol=SPY&region=US`;
    let response = await fetch (url, OPTIONS);
    let json     = await response.json();

    let yesterdayClose  = 0;
    let yesterdayChange = 0;

    const prices = json.prices.reverse().map((price) => 
    {
        if(price.type == "DIVIDEND") return {type: "DIVIDEND"};

        const change = yesterdayClose > 0 ? price.close - yesterdayClose : 0;
        const percentChange = yesterdayClose > 0 ? (change / yesterdayClose) : 0;

        const rev = (yesterdayChange == 0 || change == 0) ? 0 :
                    (yesterdayChange * change > 0)        ? 100000 * Math.abs(percentChange) : -100000 * Math.abs(percentChange);

        const ret = 
        {
            date: price.date,
            dateStr: new Date(price.date * 1000).toLocaleDateString(),
            open: price.open.toFixed(2),
            close: price.close.toFixed(2),
            change: change.toFixed(2),
            percentChange: percentChange.toFixed(4),
            revenue: rev.toFixed(2)
        }

        yesterdayClose  = price.close;
        yesterdayChange = change;

        return ret;
    });

    const pricesNoDiv = prices.filter((price) => price.type != "DIVIDEND");

    return pricesNoDiv;
}

router.get("/history", function (req, response, next) 
{
    // getHistoricalData(req, response)
    getChartData(req, response)
    .then((prices) => 
    {
        response.append("Access-Control-Allow-Origin", "*");
        response.send(prices);
    })
    .catch((e) => 
    {
        response.append("Access-Control-Allow-Origin", "*");
        response.send("Failed to get data");            
        console.error(e);
        debugger;
    }); 
});

async function getStockInfo(req)
{
    const symbol = req.query.q;

    let url      = `${YH_MARKET_URL_V2}/get-quotes?symbols=${symbol}&region=US`;
    let response = await fetch (url, OPTIONS);
    let json     = await response.json();

    return json.quoteResponse.result[0];

    // const stockPrice = json.quoteResponse.result[0].regularMarketPrice;

    // url      = `${YH_FINANCE_URL_V2}/get-financials?symbol=${symbol}&region=US`;
    // response = await fetch (url, OPTIONS);
    // json     = await response.json();

    // json["marketPrice"] = stockPrice;

    // return json;
}

router.get("/stock-info", function (req, response, next) 
{
    // const symbol = req.query.q;

    // //get financial info of the stock
    // let url   = `${YH_FINANCE_URL_V2}/get-financials?symbol=${symbol}&region=US`;

    // fetch (url, OPTIONS)
    // .then(res => res.json())

    getStockInfo(req)
    .then(json => 
    {
        response.append("Access-Control-Allow-Origin", "*");
        response.send(json);            
    })
    .catch((e) => 
    {
        response.append("Access-Control-Allow-Origin", "*");
        response.send("Failed to get data");            
        console.error(e);
        debugger;
    }); 
});

router.get("/options", function (req, response, next) 
{
    const symbol = req.query.q;
    const date = req.query.date ? req.query.date : '';

    /*get options info: 
    if date is not specified, return the contarcts by date*/
    let url   = `${YH_FINANCE_URL_V2}/get-options?symbol=${symbol}&region=US&date=${date}`;

    fetch (url, OPTIONS)
    .then(res => res.json())
    .then(json => 
    {
        response.append("Access-Control-Allow-Origin", "*");
        response.send(json);            
    })
    .catch((e) => 
    {
        response.append("Access-Control-Allow-Origin", "*");
        response.send("Failed to get data");            
        console.error(e);
        debugger;
    }); 
    //end of function
});

module.exports = router;
