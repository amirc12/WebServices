//Main file of WebServices
const express = require("express");

const translator = require("./routes/translate");
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());
app.use(bodyParser.text());


app.use(express.json());
app.use("/translate", translator);

app.listen(5000, () => console.log("Server listening at http://localhost:5000") );
