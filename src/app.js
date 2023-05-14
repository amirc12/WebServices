require('dotenv').config()

const express = require("express");

const fs         = require("fs");
const bodyParser = require('body-parser');
const utils      = require('./utils');
const translator = require("./routes/translate");
const finance    = require("./routes/finance");
const studio     = require("./routes/studio");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());
app.use(bodyParser.text());

app.use(express.json());
app.use("/translate", translator);
app.use("/finance", finance);
app.use("/studio", studio);

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
    contactData.push(JSON.parse(req.body));

    try
    {
        let data = JSON.stringify(contactData, null, 2);
        fs.writeFile(filePath, data, function (err) 
        {
            if (err) throw err;
            console.log('Contatc Data saved');
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
    //little patch to support editor page of SHIRCO STUDIO
    const fileName = (req.originalUrl == "/" || req.originalUrl == "/editor") ? "/index.html" : req.originalUrl;
    const filePath = utils.getCurrentDomainFilePath(req, fileName);
    return res.sendFile(filePath);
});


