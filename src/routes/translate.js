const utils = require('../utils');
const moment = require("moment");

const fs = require("fs");

const googleKeyPath = require('path').format({ dir: process.cwd(), base: process.env.GOOGLE_KEY });
const dictionaryPath = require('path').format({ dir: process.cwd(), base: process.env.DICTIONARY });

console.log(dictionaryPath);

const dictionary = require(dictionaryPath);
// const dictionary = require(process.env.DICTIONARY);

const express = require("express");
const router = express.Router();

//For basic translate:
const {Translate} = require('@google-cloud/translate').v2;

//For advance translate:
const {TranslationServiceClient} = require('@google-cloud/translate');

// Creates a basic client:
const translate = new Translate({keyFilename: googleKeyPath});

// Creates an advance client:
const translationClient = new TranslationServiceClient({keyFilename: googleKeyPath});

async function translateTextBasic(words) 
{
    const target = 'he';

    // Translates the text into the target language. "text" can be a string for
    // translating a single piece of text, or an array of strings for translating multiple texts.
    const options = 
    {
        to: target,
        model: "nmt"    // Possible values are "base" and "nmt"
    };

    let [translations] = await translate.translate(words, options);

    translations = Array.isArray(translations) ? translations : [translations];
    console.log('Translations:');

    translations.forEach((translation, i) => 
    {
        console.log(`${i} - ${words[i]} => (${target}) ${translation}`);
    });

    let json = {};
    for(let i = 0; i < words.length; i++)
    {
        json[words[i]] = translations[i];
    }

    return json;
    //return translations;
}

async function OnPostRequest(req, response)
{
    const body = req.body;
    let str = body.toLowerCase();
    
    let regex = /[a-zA-Z]{3,10}/gi;
    let words = str.match(regex);

    let wordSet = new Set(words);      
    words = Array.from(wordSet);
    words = words.filter(word => (word != 'the' && word != 'are' && word != 'and'));

    let googleWords = [];
    let translatedWords = {};

    //first search the words in our dictionary file
    for(const word of words)
    {
        if(dictionary.hasOwnProperty(word))
            translatedWords[word] = dictionary[word];
        else
            googleWords.push(word);
    }

    //then send to Google the words that were not found
    let promises = [];
    let start = 0, end = 0;    
    while(end < googleWords.length)
    {
        start = end;
        end = (end + 128) < googleWords.length ? end + 128 : googleWords.length;
        promises.push(translateTextBasic(googleWords.slice(start, end)));
    }

    let values = await Promise.all(promises);

    let googleTranslated = {};
    for(let value of values)
    {
        Object.assign(googleTranslated, value);
    }
    
    for(const word of googleWords)
    {
        translatedWords[word] = googleTranslated[word];

        //also update dictionary with new words translated by Google
        dictionary[word] = googleTranslated[word];
    }

    //append new words translated by Google to dictionary file
    let data = JSON.stringify(dictionary, null, 2);
    try
    {
        //fs.writeFileSync(process.env.DICTIONARY, data);
        //fs.appendFile(process.env.DICTIONARY, data);
        fs.writeFile(dictionaryPath, 'data', function (err) 
        {
            if (err) throw err;
            console.log('Dictionary saved');
        });
    }
    catch(e)
    {
        console.error(e);
        debugger;
    }

    translatedWords.googleWords = googleWords.length;
    
    return translatedWords;
}

router.post("/", function (req, response, next) 
{
    OnPostRequest(req, response)
    .then((json) => 
    {
        response.append("Access-Control-Allow-Origin", "*");
        response.send(json);
    })
    .catch((e) => 
    {
        console.error(e);
        debugger;
    }); 
});

function parseFile()
{
    const fileName = require('path').format({ dir: __dirname, base: "finance.js" });

    const file = fs.readFileSync(fileName, 'utf8');
    let charCount = file.length;

    //get characters withou spaces, tabs etc.
    const removeSpecialsRegEx = /[ \n\r\t]/g;
    const chars = file.replace(removeSpecialsRegEx, '');
    charCount = chars.length;

    //search for comments
    const commentsRegEx = /\/\/[^\n]+|\/\*[^\*\/]+/g;
    let comments = file.match(commentsRegEx);
    comments = Array.from(comments, comment => comment.replace(removeSpecialsRegEx, ''));

    //calculate comments num of chars 
    const commentLength = comments.reduce((count, comment) => 
    {
        return count + comment.length;
    }, 0);

    //split file content to lines
    let lines = file.split("\r\n");

    //remove empty lines
    lines = lines.filter(line => line.length > 0);

    const linesCount = lines.length;
}

/* GET users listing. */
router.get("/", function (req, response, next) 
{
    parseFile();

    response.append("Access-Control-Allow-Origin", "*");
    response.send({a:1, b:2});
});

function saveDataToFile(req, data, fileName)
{
    const filePath = utils.getCurrentDomainFilePath(req, fileName);

    let dataStr = JSON.stringify(data, null, 2);
    try
    {
        fs.writeFile(filePath, dataStr, function (err) 
        {
            if (err) throw err;
            console.log('Words Data Saved');
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

function loadDataFromFile(req, fileName)
{
    const filePath = utils.getCurrentDomainFilePath(req, fileName);
    const jsonStr = fs.readFileSync(filePath);
    const words = JSON.parse(jsonStr);
    return words;
}

router.get("/my_words", function (req, response, next) 
{
    const name = req.query.q;

    const myWords = loadDataFromFile(req, "my_words.json");

    myWords.sort((a, b) =>
    {
        const am = moment(a.date, 'DD/MM/YYYY');
        const bm = moment(b.date, 'DD/MM/YYYY');
        const ret = am.isBefore(bm) ? 1 : -1;
        return ret;
    });

    response.append("Access-Control-Allow-Origin", "*");
    response.send(myWords);
});

router.get("/details_words", function (req, response, next) 
{
    const name = req.query.q;

    const detailsWords = loadDataFromFile(req, "details_words.json");

    response.append("Access-Control-Allow-Origin", "*");
    response.send(detailsWords);
});

router.post("/update_series", function (req, response, next) 
{
    const myWords = loadDataFromFile(req, "my_words.json");
    const body = JSON.parse(req.body);

    let index = myWords.findIndex((item) => item.date === body.date);
    if(index >= 0)
    {
        const dayWords = myWords[index];
        dayWords.series = body.series;
    }
    else
    {
        const newDay = {date: body.date, series: body.series};
        myWords.push(newDay);
    }

    saveDataToFile(req, myWords, "my_words.json");

    response.append("Access-Control-Allow-Origin", "*");
    response.send({result: 'ok'});
});

router.post("/new_details", function (req, response, next) 
{
    const body = JSON.parse(req.body);

    let myWords = loadDataFromFile(req, "details_words.json");
    myWords.push(body);

    saveDataToFile(req, myWords, "details_words.json");

    response.append("Access-Control-Allow-Origin", "*");
    response.send({result: 'ok'});
});

module.exports = router;
