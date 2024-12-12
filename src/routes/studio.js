const express = require("express");
const router  = express.Router();

const fs        = require("fs");
const path      = require("path");
const utils     = require('../utils');
const moment    = require("moment");

class Mutex 
{
    constructor() {this.isLocked = false;}

    async lock() 
    {
        while(this.isLocked)
            await new Promise(resolve => setTimeout(resolve, 50)); // Wait until unlocked

        this.isLocked = true;
    }

    unlock() {this.isLocked = false;}
}

const g_Mutex = new Mutex;

async function savePlansToFile(req, plans)
{
    const filePath = utils.getCurrentDomainFilePath(req, "studio_week_plan.json");

    await g_Mutex.lock();

    try
    {
        let plansStr = JSON.stringify(plans, null, 2);
        fs.writeFileSync(filePath, plansStr, 'utf8');
        console.log('Plans file saved successfully');
    }
    catch(err)
    {
        console.error(err);
        debugger;
    }

    g_Mutex.unlock();
}

async function loadPlansFromFile(req)
{
    let plans = [];

    const filePath = utils.getCurrentDomainFilePath(req, "studio_week_plan.json");

    await g_Mutex.lock();

    try
    {
        const jsonStr = fs.readFileSync(filePath, 'utf8');
        plans = JSON.parse(jsonStr);
        console.log('Plans file loaded successfully');
    }
    catch(err)
    {
        if(fs.existsSync(filePath))
        {
            const invalidFilePath = utils.getCurrentDomainFilePath(req, "invalid_studio_week_plan.json");
            fs.copyFileSync(filePath, invalidFilePath);
        }
        console.error(err);
        debugger;
    }

    g_Mutex.unlock();
    return plans;
}

router.get("/week_plan", async function (req, response, next) 
{
    let plans = await loadPlansFromFile(req);

    const dates = plans.length > 0 ? plans.map((plan) => plan.date) : [];
    
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
        await savePlansToFile(req, plans);
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

router.post("/update_plan", async function (req, response, next) 
{
    let plans = await loadPlansFromFile(req);

    const body = JSON.parse(req.body);

    let index = plans.findIndex((plan) => plan.date === body.date);
    const plan = plans[index];

    index = plan.days.findIndex(item => item.header === body.day.header);
    plan.days.splice(index, 1, body.day);    

    await savePlansToFile(req, plans);

    response.append("Access-Control-Allow-Origin", "*");
    response.send({result: 'ok'});
});

router.get("/delete", async function (req, response, next) 
{
    let plans = await loadPlansFromFile(req);
    
    const index = plans.findIndex((plan) => plan.date === req.query.date);
    if(index >= 0)
    {
        const newPlans = plans.filter((plan) => (plan.date !== req.query.date));
        await savePlansToFile(req, newPlans);
    }

    response.append("Access-Control-Allow-Origin", "*");
    response.send({result: 'ok'});
});

module.exports = router;
