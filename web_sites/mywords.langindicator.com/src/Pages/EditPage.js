import './EditPage.css';
import * as React from 'react';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const moment = require("moment");
const constants = require("../constants");

const styles =
{
    textField : {backgroundColor: 'white', width: '100%', marginTop: '15px'},
    button    : {width: '100%', marginTop: '20px'}
};

async function postWords(data)
{
    let today = moment().format('DD/MM/YYYY');

    const options =
    {
        method  : "POST",
        headers : {},
        body    : JSON.stringify({date: today, words: data})
    };

    try
    {
        const url      = `${constants.API_URL}/add_series`;
        const response = await fetch (url, options);
        const data     = await response.json();    
    }
    catch(e)
    {
        console.log(e);
        // debugger;
    }
}

function EditCard()
{
    const [word1, setWord1] = useState('');
    const [word2, setWord2] = useState('');
    const [word3, setWord3] = useState('');
    const [word4, setWord4] = useState('');
    
    function onClickSave()
    {
        let series = [];
        if(word1.length > 0 ) series.push(word1);
        if(word2.length > 0 ) series.push(word2);
        if(word3.length > 0 ) series.push(word3);
        if(word4.length > 0 ) series.push(word4);

        postWords(series);

        setWord1('');
        setWord2('');
        setWord3('');
        setWord4('');
    }

    return(
        <div className='edit_card'>
            <TextField style={styles.textField} size='small' value={word1} onChange={(e) => setWord1(e.target.value)}/>
            <TextField style={styles.textField} size='small' value={word2} onChange={(e) => setWord2(e.target.value)}/>
            <TextField style={styles.textField} size='small' value={word3} onChange={(e) => setWord3(e.target.value)}/>
            <TextField style={styles.textField} size='small' value={word4} onChange={(e) => setWord4(e.target.value)}/>
            <Button style={styles.button} variant="contained" onClick={onClickSave}>Save Words</Button>
        </div>
    );
}

function EditPage()
{
    return(
        <div className='edit_page'>
            <EditCard />
        </div>
    );
}

export default EditPage;
