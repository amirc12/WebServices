const express = require("express");
const router = express.Router();

const fs    = require("fs");
const path  = require("path");
const utils = require('../utils');
const moment = require("moment");

function savePlansToFile(req, plans)
{
    const filePath = utils.getCurrentDomainFilePath(req, "studio_week_plan.json");

    let plansStr = JSON.stringify(plans, null, 2);
    try
    {
        fs.writeFile(filePath, plansStr, function (err) 
        {
            if (err) throw err;
            console.log('Plan saved');
            // response.append("Access-Control-Allow-Origin", "*");
            // response.send({status: 'ok'});    
        });
    }
    catch(e)
    {
        console.error(e);
        debugger;
    }
}

function loadPlansFromFile(req)
{
    const filePath = utils.getCurrentDomainFilePath(req, "studio_week_plan.json");
    // const plans = require(filePath);
    const jsonStr = fs.readFileSync(filePath);
    const plans = JSON.parse(jsonStr);
    return plans;
}

router.post("/update_plan", function (req, response, next) 
{
    let plans = loadPlansFromFile(req);

    const body = JSON.parse(req.body);

    let index = plans.findIndex((plan) => plan.date === body.date);
    const plan = plans[index];

    index = plan.days.findIndex(item => item.header === body.day.header);
    plan.days.splice(index, 1, body.day);    

    savePlansToFile(req, plans);

    response.append("Access-Control-Allow-Origin", "*");
    response.send({result: 'ok'});
});

router.get("/delete", function (req, response, next) 
{
    let plans = loadPlansFromFile(req);
    
    const index = plans.findIndex((plan) => plan.date === req.query.date);
    if(index >= 0)
    {
        const newPlans = plans.filter((plan) => (plan.date !== req.query.date));
        savePlansToFile(req, newPlans);
    }

    response.append("Access-Control-Allow-Origin", "*");
    response.send({result: 'ok'});
});

router.get("/week_plan", function (req, response, next) 
{
    let plans = loadPlansFromFile(req);

    const dates = plans.map((plan) => plan.date);
    
    let plan = {};
    const index = plans.findIndex((plan) => plan.date === req.query.date);
    if(index >= 0)
        plan = plans[index];
    else
    {
        dates.unshift(req.query.date);
        plan = {date: req.query.date, days: []}
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        for(const day of weekdays)
        {
            plan.days.push({header: day, name: '', details: '', warm_up: ''});
        }

        plans.unshift(plan); //insert at the begining of the array
        savePlansToFile(req, plans);
    }

    dates.sort((a, b) =>
    {
        const am = moment(a, 'DD/MM/YYYY');
        const bm = moment(b, 'DD/MM/YYYY');
        const ret = am.isBefore(bm) ? 1 : -1;
        return ret;
    });

    response.append("Access-Control-Allow-Origin", "*");
    response.send({dates: dates, plan: plan});
});

module.exports = router;
