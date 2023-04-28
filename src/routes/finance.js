const fetch = require("node-fetch");
const express = require("express");
const router = express.Router();
	
const API_URL = process.env.FINANCE_API_URL;

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

router.get("/stock-info", function (req, response, next) 
{
    const symbol = req.query.q;

    //get financial info of the stock
    let url   = `${API_URL}/get-financials?symbol=${symbol}&region=US`;

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
    let url   = `${API_URL}/get-options?symbol=${symbol}&region=US&date=${date}`;

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
