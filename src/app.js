const express = require("express");

const translator = require("./routes/translate");
const finance = require("./routes/finance");
const bodyParser = require('body-parser');
// const path       = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());
app.use(bodyParser.text());

app.use(express.json());
app.use("/translate", translator);
app.use("/finance", finance);

app.get("/", (req, res) => 
{
    console.log('get request');
    return res.send("web services GET response");
});

app.post("/", (req, res) => 
{
    return res.send("web services POST response");
});

const PORT = process.env.PORT || 5000;
app.listen(5000, () => console.log(`Server listening at http://localhost:${PORT}`) );
