import './NewDetailsPage.css';
import * as React from 'react';
import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import utils from '../utils';

const moment = require("moment");
const constants = require("../constants");

const styles =
{
    textFieldToday    : {backgroundColor: '#edf7ed', width: '100%', marginTop: '10px'},
    buttonToday       : {backgroundColor: '#375b39', width: '100%', marginTop: '10px', marginBottom: '20px'},
};

async function postWords(postData)
{
    const options =
    {
        method  : "POST",
        headers : {},
        body    : JSON.stringify(postData)
    };

    try
    {
        const url      = `${constants.API_URL}/new_details`;
        const response = await fetch (url, options);
        const data     = await response.json();    
    }
    catch(e)
    {
        console.log(e);
        // debugger;
    }
}

function EditCard({date, series, title})
{
    const [word, setWord]             = useState("");
    const [definition, setDefinition] = useState("");
    const [example, setExample]       = useState("");

    function onClickSave()
    {
        let postData = {date: date, word: word, definition: definition, example: example, score: 1};
        postWords(postData);
    }

    return(
        <div className='edit_card'>
            <TextField style={styles.textFieldToday} size='small' label="Word/Phrase" onChange={(e) => setWord(e.target.value)}/>
            <TextField style={styles.textFieldToday} multiline rows={2} label="Definition" onChange={(e) => setDefinition(e.target.value)}/>
            <TextField style={styles.textFieldToday} multiline rows={2} label="Example" onChange={(e) => setExample(e.target.value)}/>
            <Button style={styles.buttonToday} variant="contained" onClick={onClickSave}>Add new word/phrase</Button>
        </div>
    );
}

function NewDetailsPage()
{
    const today = moment().format('DD/MM/YYYY');

    return(
        <div className='edit_page'>
            <EditCard date={today} title='Today'/>
        </div>
    );
}

export default NewDetailsPage;
