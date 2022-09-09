
const dictionayFile = "../dictionary.json";
const googleKeyFile = "summer-pattern-337013-9b9ec96d24ea.json";


// const fs = require("fs");
const dictionary = require(dictionayFile);

const express = require("express");
const router = express.Router();

//For basic translate:
const {Translate} = require('@google-cloud/translate').v2;

//For advance translate:
const {TranslationServiceClient} = require('@google-cloud/translate');

// Creates a basic client:
const translate = new Translate({keyFilename: googleKeyFile});

// Creates an advance client:
const translationClient = new TranslationServiceClient({keyFilename: googleKeyFile});

async function translateTextBasic(words) 
{
    const target = 'he';

    // Translates the text into the target language. "text" can be a string for
    // translating a single piece of text, or an array of strings for translating
    // multiple texts.
    const options = 
    {
        to: target,
        model: "nmt"    // Possible values are "base" and "nmt"
    };

    let [translations] = await translate.translate(words, options);
    //let response = await translate.translate(words, options);

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
    let wordsJson = {};

    //first search the words in our dictionary.json file
    for(let i = 0; i < words.length; i++)
    {
        wordsJson[words[i]] = dictionary[words[i]];
        if(wordsJson[words[i]] === undefined)
            googleWords.push(words[i]);
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

    let json = {};
    for(let value of values)
    {
        Object.assign(json, value);
    }
    
    for(let i = 0; i < googleWords.length; i++)
    {
        wordsJson[googleWords[i]] = json[googleWords[i]];
    }

    //update dictionary to be saved with new words
    for(let i = 0; i < words.length; i++)
    {
        dictionary[words[i]] = wordsJson[words[i]];
    }

    let data = JSON.stringify(dictionary, null, 2);
    // try
    // {
    //     fs.writeFileSync(dictionayFile, data);
    // }
    // catch(e)
    // {
    //     return ({err: e});
    // }

    wordsJson.googleWords = googleWords.length;
    
    return wordsJson;
}

router.post("/", function (req, response, next) 
{
    // response.append("Access-Control-Allow-Origin", "*");
    // response.send(req.body);
    // return;
    //ConvertDictionaryFile();
    //return;

    //translateTextAdvance('aaa')
    //return;

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

/* GET users listing. */
router.get("/", function (req, response, next) 
{
    response.append("Access-Control-Allow-Origin", "*");
    response.send({a:1, b:2});
});

module.exports = router;
