const fs = require("fs");
const path       = require("path");

const fetch = require("node-fetch");
const express = require("express");
const router = express.Router();
	
const FINANCE_URL = process.env.FINANCE_API_URL;
const MARKET_URL = process.env.MARKET_API_URL;

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

    let filePath = path.join(process.cwd() + "/src/" + req.hostname.replace('www.', '') + "/portfolio.json");
    const portfolioData = require(filePath);

    response.append("Access-Control-Allow-Origin", "*");
    response.send(portfolioData);
});

async function getPortfolioStatus(req, res)
{
    const name = req.query.q;

    const filePath = path.join(process.cwd() + "/src/" + req.hostname.replace('www.', '') + "/portfolio.json");
    const portfolioData = require(filePath);

    let symbols = "";

    for(item of portfolioData)
        symbols += `${item.symbol},`

    // https://yh-finance.p.rapidapi.com/market/v2/get-quotes?region=US&symbols=AMD,IBM,
    let url   = `${MARKET_URL}/get-quotes?symbols=${symbols}&region=US`;
    let response = await fetch (url, OPTIONS);
    let json     = await response.json();

    for(let item of portfolioData)
    {
        const matchResult = json.quoteResponse.result.find(quote => quote.symbol == item.symbol);
        item["current_stock_price"] = matchResult.regularMarketPrice;
    }

    let promises = [];
    for(let item of portfolioData)
    {
        const date = Date.parse(item.exp_date)/1000;
        const url = `${FINANCE_URL}/get-options?symbol=${item.symbol}&region=US&date=${date}`;
        await new Promise(r => setTimeout(r, 500));
        promises.push(fetch(url, OPTIONS).then(res => res.json()).catch(e => {}));
    }

    const optionsData = await Promise.all(promises);

    for(let i = 0; i < portfolioData.length; i++)
    {
        if(optionsData[i])
        {
            const call = optionsData[i].contracts.calls.find(item => item.strike.raw == portfolioData[i].strike);
            const price = call.bid.raw ? call.bid.raw : call.lastPrice.raw;
            portfolioData[i]["current_call_price"] = price;    
        }
    }

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

router.get("/stock-info", function (req, response, next) 
{
    const symbol = req.query.q;

    //get financial info of the stock
    let url   = `${FINANCE_URL}/get-financials?symbol=${symbol}&region=US`;

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
});

router.get("/options", function (req, response, next) 
{
    const symbol = req.query.q;
    const date = req.query.date ? req.query.date : '';

    /*get options info: 
    if date is not specified, return the contarcts by date*/
    let url   = `${FINANCE_URL}/get-options?symbol=${symbol}&region=US&date=${date}`;

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
