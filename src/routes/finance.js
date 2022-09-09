const fetch = require("node-fetch");
const express = require("express");
const router = express.Router();

const API_URL = "https://yh-finance.p.rapidapi.com/stock/v2";

const OPTIONS =
{
    method:  "GET",
    headers: 
    {
        "X-RapidAPI-Key"  : "4f1e4a5020msh3f7051a5abbf94bp1fb4e4jsne79536f67c10",
        "X-RapidAPI-Host" : "yh-finance.p.rapidapi.com",
    }
};

router.post("/", function (req, response, next) 
{
});

router.get("/stock-info", function (req, response, next) 
{
    const symbol = req.query.q;

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
});

module.exports = router;
