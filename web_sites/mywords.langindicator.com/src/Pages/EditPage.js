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
    textFieldToday : {backgroundColor: '#edf7ed', width: '100%', marginTop: '5px'},
    buttonToday    : {backgroundColor: '#375b39', width: '100%', marginTop: '10px', marginBottom: '20px'}
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
    const [series0, setSeries0] = useState(series[0]);
    const [series1, setSeries1] = useState(series[1]);
    const [series2, setSeries2] = useState(series[2]);
    const [series3, setSeries3] = useState(series[3]);
 
    useEffect(() => 
    {
        setSeries0(series[0]);
        setSeries1(series[1]);
        setSeries2(series[2]);
        setSeries3(series[3]);
    }, [series]);
    
    function onClickSave()
    {
        let postData = {date: date, series: []};

        postData.series.push(getWordsArrayFromString(series0));
        postData.series.push(getWordsArrayFromString(series1));
        postData.series.push(getWordsArrayFromString(series2));
        postData.series.push(getWordsArrayFromString(series3));

        postWords(postData);
    }

    const textStyle   = (title === 'Today') ? styles.textFieldToday : styles.textFieldTomorrow;
    const buttonStyle = (title === 'Today') ? styles.buttonToday : styles.buttonTomorrow;

    return(
        <div className='edit_card'>
            <TextField style={textStyle} size='small' value={series0} onChange={(e) => setSeries0(e.target.value)}/>
            <TextField style={textStyle} size='small' value={series1} onChange={(e) => setSeries1(e.target.value)}/>
            <TextField style={textStyle} size='small' value={series2} onChange={(e) => setSeries2(e.target.value)}/>
            <TextField style={textStyle} size='small' value={series3} onChange={(e) => setSeries3(e.target.value)}/>
            <Button style={buttonStyle} variant="contained" onClick={onClickSave}>Save for {title} ({date})</Button>
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
