const express = require("express");
const router = express.Router();

const fs    = require("fs");
const path  = require("path");
const utils = require('../utils');

router.post("/update_plan", function (req, response, next) 
{
    const filePath = utils.getCurrentDomainFilePath(req, "studio_week_plan.json");
    const weekPlan = require(filePath);

    const plan = JSON.parse(req.body);

    if(plan.hasOwnProperty('edit'))
        delete plan.edit;

    const index = weekPlan.findIndex(item => item.header === plan.header);
    weekPlan.splice(index, 1, plan);    

    let weekPlanStr = JSON.stringify(weekPlan, null, 2);
    try
    {
        fs.writeFile(filePath, weekPlanStr, function (err) 
        {
            if (err) throw err;
            console.log('Dictionary saved');
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

router.get("/week_plan", function (req, response, next) 
{
    const filePath = utils.getCurrentDomainFilePath(req, "studio_week_plan.json");
    let weekPlan = require(filePath);

    const action = req.query.q;
    if(action === 'edit')
    {
        weekPlan = weekPlan.map((item) => {return { ...item, edit: true };});
    }

    response.append("Access-Control-Allow-Origin", "*");
    response.send(weekPlan);
});

module.exports = router;
