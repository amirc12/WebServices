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
    console.log('/post request');
    return res.send("web services POST response");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening at http://localhost:${PORT}`) );

//Handle contact us request
app.post("/contact", (req, res) => 
{
    console.log('/contact request');
    const filePath = utils.getCurrentDomainFilePath(req, "contact_data.json");
    const contactData = require(filePath);

    let newMsg = JSON.parse(req.body);
    const currentDate = moment().format('YYYY-MM-DD');
    // newMsg.date = currentDate;
    newMsg = {date: currentDate, ...newMsg};

    // contactData.push(JSON.parse(req.body));
    contactData.push(newMsg);
``
    try
    {
        let data = JSON.stringify(contactData, null, 2);
        fs.writeFile(filePath, data, function (err) 
        {
            if (err) throw err;
            console.log('Contact Data saved');
        });
    }
    catch(e)
    {
        console.error(e);
        debugger;
    }

    res.append("Access-Control-Allow-Origin", "*");
    res.send({status:1});

    // let thanksPage = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/contact_ty.html");
    // return res.sendFile(thanksPage);

    // return res.redirect('contact_ty.html');

    // res.setHeader('Content-Type', 'text/html');
    // res.statusCode = 302;
    // res.setHeader('Location', '/');
    // return res.end();
});

//Workaround to host web sites of of different domains (language-indicator and hamadaf-hakatan)
app.get(/[a-z]|\//, (req, res) => 
{
    //little patch to support direct navigation to editor page of SHIRCO STUDIO and portfolio page of options
    let fileName = (req.originalUrl == "/"        || 
                      req.originalUrl == "/editor"  || 
                      req.originalUrl == "/portfolio") ? "/index.html" : req.originalUrl;

    const filePath = utils.getCurrentDomainFilePath(req, fileName);
    
    return res.sendFile(filePath, (err) =>
    {
        if(err && err.code == 'ENOENT')
        {
            res.status(404).send('Custom 404 Error: File Not Found');                        
        }
    });

    // const domainDir = utils.getCurrentDomainDir(req);    
    // const options = {root: domainDir};
    // return res.sendFile(fileName, options);
});


