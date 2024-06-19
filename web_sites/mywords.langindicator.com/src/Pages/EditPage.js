import './EditPage.css';
import * as React from 'react';
import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import utils from '../utils';

const moment = require("moment");
const constants = require("../constants");

const styles =
{
    textFieldTomorrow : {backgroundColor: '#e5f6fd', width: '100%', marginTop: '5px'},
    buttonTomorrow    : {backgroundColor: '#014361', width: '100%', marginTop: '10px', marginBottom: '20px'},
    textFieldToday    : {backgroundColor: '#edf7ed', width: '100%', marginTop: '5px'},
    buttonToday       : {backgroundColor: '#375b39', width: '100%', marginTop: '10px', marginBottom: '20px'},
    buttonDisabled    : {color: 'gray', backgroundColor: 'lightgray', width: '100%', marginTop: '10px', marginBottom: '20px'}
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
        const url      = `${constants.API_URL}/update_series`;
        const response = await fetch (url, options);
        const data     = await response.json();    
    }
    catch(e)
    {
        console.log(e);
        // debugger;
    }
}

function getWordsArrayFromString(str)
{
    const words = str.split(',');

    return [words[0]?.length ? words[0] : '', 
            words[1]?.length ? words[1] : '', 
            words[2]?.length ? words[2] : '', 
            words[3]?.length ? words[3] : ''];
}

function EditCard({date, series, title})
{
    const [wordSeries, setWordSeries] = useState({'0':'', '1':'', '2':'', '3':''});
    const [isDataChanged, setIsDataChanged] = useState(false);
 
    useEffect(() => 
    {
        setWordSeries({'0': series[0], '1': series[1], '2': series[2], '3': series[3]});
    }, [series]);
    
    function onClickSave()
    {
        let postData = {date: date, series: []};

        postData.series.push(getWordsArrayFromString(wordSeries['0']));
        postData.series.push(getWordsArrayFromString(wordSeries['1']));
        postData.series.push(getWordsArrayFromString(wordSeries['2']));
        postData.series.push(getWordsArrayFromString(wordSeries['3']));

        postWords(postData);
        setIsDataChanged(false);
    }

    function handleDataChange(e, key)
    {
        let newWords = {...wordSeries};
        newWords[key] = e.target.value;
        setWordSeries(newWords);
        setIsDataChanged(true);
    }

    const textStyle   = (title === 'Today') ? styles.textFieldToday : styles.textFieldTomorrow;

    const buttonStyle = (!isDataChanged)    ? styles.buttonDisabled : 
                        (title === 'Today') ? styles.buttonToday    : styles.buttonTomorrow;

    return(
        <div className='edit_card'>
            <TextField style={textStyle} size='small' value={wordSeries['0']} onChange={(e) => handleDataChange(e, '0')}/>
            <TextField style={textStyle} size='small' value={wordSeries['1']} onChange={(e) => handleDataChange(e, '1')}/>
            <TextField style={textStyle} size='small' value={wordSeries['2']} onChange={(e) => handleDataChange(e, '2')}/>
            <TextField style={textStyle} size='small' value={wordSeries['3']} onChange={(e) => handleDataChange(e, '3')}/>
            <Button disabled={isDataChanged ? false : true} style={buttonStyle} variant="contained" onClick={onClickSave}>Save for {title} ({date})</Button>
        </div>
    );
}

function extractSeriesByDate(date, myWordsData)
{
    const index = myWordsData.findIndex((item) => item.date === date);

    const series = (index >= 0) ? myWordsData[index].series : [[], [], [], []];

    const ret = series.map(item => 
    {
        let str = item.toString();
        str = str.replace(',,,', '');
        str = str.replace(',,', '');
        return str;
    });

    return ret;
}

function EditPage()
{
    const [myWordsData, setMyWordsData] = useState([]);

    useEffect(() => 
    {
        async function fetchData() 
        {
            const data = await utils.fetchMyWordsData();
            setMyWordsData(data);
        }
        fetchData();
    }, []);

    const today = moment().format('DD/MM/YYYY');
    const todaySeries = extractSeriesByDate(today, myWordsData);

    const tomorrow = moment().add(1, 'day').format('DD/MM/YYYY');
    const tomorrowSeries = extractSeriesByDate(tomorrow, myWordsData);

    return(
        <div className='edit_page'>
            <EditCard date={tomorrow} series={tomorrowSeries} title='Tomorrow'/>
            <EditCard date={today} series={todaySeries} title='Today'/>
        </div>
    );
}

export default EditPage;
