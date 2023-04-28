require('dotenv').config()

const fs = require("fs");

const express = require("express");

const translator = require("./routes/translate");
const finance = require("./routes/finance");
const bodyParser = require('body-parser');
const path       = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());
app.use(bodyParser.text());

app.use(express.json());
app.use("/translate", translator);
app.use("/finance", finance);

app.post("/", (req, res)=> 
{
    console.log('/post request');
    return res.send("web services POST response");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening at http://localhost:${PORT}`) );

//kind of patch to host web sites of language-indicator and hamadaf-hakatan
app.get("/", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/index.html");
    return res.sendFile(filePath);

    // return res.send("web services GET response");
});

//Handle contact us request
app.post("/contact", (req, res) => 
{
    console.log('/contact request');
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/contact_data.json");
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

app.get("/contact_data.json", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/contact_data.json");
    return res.sendFile(filePath);
});

app.get("/index.html", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/index.html");
    return res.sendFile(filePath);
});

app.get("/contact.html", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/contact.html");
    return res.sendFile(filePath);
});

app.get("/about.html", (req, res) => 
{
    console.log('/about.html request');
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/about.html");
    return res.sendFile(filePath);
});

app.get("/inst_complete.html", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/inst_complete.html");
    return res.sendFile(filePath);
});

app.get("/contact_ty.html", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/contact_ty.html");
    return res.sendFile(filePath);
});

app.get("/eula.html", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/eula.html");
    return res.sendFile(filePath);
});

app.get("/site.css", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/site.css");
    return res.sendFile(filePath);
});

app.get("/site.js", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/site.js");
    return res.sendFile(filePath);
});

//Download files
app.get("/LangIndicator.zip", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/LangIndicator.zip");
    return res.sendFile(filePath);
});

app.get("/setup.exe", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/setup.exe");
    return res.sendFile(filePath);
});

//Images for language-indicator
app.get("/settings.png", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/settings.png");
    return res.sendFile(filePath);
});

app.get("/face.png", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/face.png");
    return res.sendFile(filePath);
});

app.get("/li_1.png", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/li_1.png");
    return res.sendFile(filePath);
});

app.get("/li_2.png", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/li_2.png");
    return res.sendFile(filePath);
});

app.get("/li_3.png", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/li_3.png");
    return res.sendFile(filePath);
});

app.get("/li_4.png", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/li_4.png");
    return res.sendFile(filePath);
});

app.get("/li_5.png", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/li_5.png");
    return res.sendFile(filePath);
});

app.get("/li_6.png", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/li_6.png");
    return res.sendFile(filePath);
});

app.get("/li_7.png", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/li_7.png");
    return res.sendFile(filePath);
});

app.get("/li_8.png", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/li_8.png");
    return res.sendFile(filePath);
});

//Images for hamadaf-hakatan
app.get("/birds.png", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/birds.png");
    return res.sendFile(filePath);
});

app.get("/cover.png", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/cover.png");
    return res.sendFile(filePath);
});

app.get("/header.png", (req, res) => 
{
    let filePath = path.join(__dirname + "/" + req.hostname.replace('www.', '') + "/header.png");
    return res.sendFile(filePath);
});
