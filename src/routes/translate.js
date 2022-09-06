
const dictionayFile = "c:\\My Documents\\My Projects\\Instranslate\\dictionary.json";
const googleKeyFile = "c:\\My Documents\\My Projects\\Instranslate\\summer-pattern-337013-9b9ec96d24ea.json";


const fs = require("fs");
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


async function translateTextAdvance(words) 
{
    const projectId = 'summer-pattern-337013';
    const location = 'global';
    const text = 'advantage';

    const request = 
    {
        parent: `projects/${projectId}/locations/${location}`,
        contents: [text],
        mimeType: 'text/plain', // mime types: text/plain, text/html
        sourceLanguageCode: 'en',
        targetLanguageCode: 'he',
    };
  
    try 
    {
        const [response] = await translationClient.translateText(request);

        for (const translation of response.translations) 
        {
            console.log(`Translation: ${translation.translatedText}`);
        }
    } 
    catch (error) 
    {
        console.log(error);        
    }

}

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
        promises.push( (googleWords.slice(start, end)));
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
    fs.writeFileSync(dictionayFile, data);
    //fs.writeFile('dictionary.json', data);

    return wordsJson;
}

/*
current file format:
{
    'word_1': 'translation_1',
    'word_2': 'translation_2',
    'word_3': 'translation_3',
}

should be changed to?
{
    'word_1': 
    {
        t: 'translation_1',
        c: 1
    },
    'word_2': 
    {
        t: 'translation_2',
        c: 2
    },
}
or
{
    'word_1': ['translation_1', 2],
    'word_2': ['translation_2', 2],
    'word_3': ['translation_3', 2],
}
*/

function ConvertDictionaryFile()
{
    let jsonOut = {};
    for(let key in dictionary)
    {
        jsonOut[key] = [dictionary[key], 1];
    }

    const fileName = "d:\\My Documents\\My Projects\\Instranslate\\dictionary_2.json";
    let data = JSON.stringify(jsonOut);
    fs.writeFileSync(fileName, data);

}


router.post("/", function (req, response, next) 
{
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
    response.send("just a test");
});

module.exports = router;
