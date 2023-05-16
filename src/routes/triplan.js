const express = require("express");
const router = express.Router();

const fs    = require("fs");
const path  = require("path");
const utils = require('../utils');

router.get("/load", function (req, response, next) 
{
    const filePath = utils.getCurrentDomainFilePath(req, `/${req.query.id}.json`);
    const tripPlan = require(filePath);

    response.append("Access-Control-Allow-Origin", "*");
    response.send(tripPlan);
});

router.post("/update", function (req, response, next) 
{
    const tripPlan = JSON.parse(req.body);

    const filePath = utils.getCurrentDomainFilePath(req, `/${tripPlan.id}.json`);
    // const tripPlan = require(filePath);

    let tripPlanStr = JSON.stringify(tripPlan, null, 2);
    try
    {
        fs.writeFile(filePath, tripPlanStr, function (err) 
        {
            if (err) throw err;
            console.log('Trip Plan Saved');
            response.append("Access-Control-Allow-Origin", "*");
            response.send({status: 'ok'});    
        });
    }
    catch(e)
    {
        console.error(e);
        debugger;
    }

});

module.exports = router;
