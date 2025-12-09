require('dotenv').config()

const express = require("express");

const fs         = require("fs");
const bodyParser = require('body-parser');
const moment     = require("moment");
const utils      = require('./utils');
const translator = require("./routes/translate");
const finance    = require("./routes/finance");
const studio     = require("./routes/studio");
// const triplan    = require("./routes/triplan");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());
app.use(bodyParser.text());

app.use(express.json());
app.use("/translate", translator);
app.use("/finance", finance);
app.use("/studio", studio);
// app.use("/plan", triplan);

app.post("/", (req, res)=> 
{
    // console.log('/post request');
    return res.send("web services POST response");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening at http://localhost:${PORT}`) );

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

//Handle contact us request
app.post("/contact", async function (req, res) 
{
    await g_Mutex.lock();

    const filePath = utils.getCurrentDomainFilePath(req, "contact_data.json");
    const contactData = require(filePath);

    let newMsg = JSON.parse(req.body);
    const currentDate = moment().format('YYYY-MM-DD');
    newMsg = {date: currentDate, ...newMsg};
    contactData.push(newMsg);

    try
    {
        let data = JSON.stringify(contactData, null, 2);
        fs.writeFile(filePath, data, function (err) 
        {
            if (err) throw err;
            // console.log('Contact Data saved');
        });
    }
    catch(e)
    {
        console.error(e);
        debugger;
    }

    g_Mutex.unlock();

    res.append("Access-Control-Allow-Origin", "*");
    res.send({status:1});
});

//Workaround to host web sites of of different domains (language-indicator and hamadaf-hakatan)
app.get(/[a-z]|\//, (req, res) => 
{
    //little patch to support direct navigation to editor page of SHIRCO STUDIO and portfolio page of options
    let fileName = (req.originalUrl == "/"        || 
                      req.originalUrl == "/editor"  || 
                      req.originalUrl == "/portfolio") ? "/index.html" : req.originalUrl;

    const filePath = utils.getCurrentDomainFilePath(req, fileName);
    
    res.sendFile(filePath, (err) =>
    {
        if(err && err.code == 'ENOENT')
        {
            res.status(404).send('Custom 404 Error: File Not Found');                        
        }
    });

    if((req.hostname == "language-indicator.com" || req.hostname == "www.language-indicator.com") && (fileName.includes(".html") || fileName.includes(".exe")))
    {
        const currentDate = moment().format('DD-MM-YYYY HH:mm:ss');
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        let line = `${currentDate} (${ip}) - ${fileName}`;
        console.log(line);
    }
    // const domainDir = utils.getCurrentDomainDir(req);    
    // const options = {root: domainDir};
    // return res.sendFile(fileName, options);
});


