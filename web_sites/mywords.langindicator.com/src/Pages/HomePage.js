import './HomePage.css';

import { useState, useEffect } from 'react';

const constants = require("../constants");

const colors = ['#014361', '#375b39', '#824d4c', '#663c00'];
const bgColors = ['#e5f6fd', '#edf7ed', '#fdeded', '#fff4e5'];

async function fetchMyWordsData()
{
    const url      = `${constants.API_URL}/my_words?q=amir`;
    const response = await fetch (url, constants.FETCH_OPTIONS);
    const myWords     = await response.json();

    return myWords;
}

function WordSeries({index, data})
{
    const words = data.map(item => <div className='single_word'>{item}</div>);

    return(
        <div className='word_series' style={{backgroundColor: bgColors[index % 3], color: colors[index % 3]}}>
            {words}
        </div>
    );
}

function DayCard({data})
{
    const series = data.series.map((item, index) => <WordSeries index={index} data={item}/>);

    return(
        <div className='day_card'>
            <div className='date_title'>{data.date}</div>
            <div className='series_container'> {series} </div>
        </div>
    );
}

function HomePage()
{
    const [myWords, setMyWords] = useState([]);

    useEffect(() => 
    {
        async function fetchData() 
        {
            const myWords = await fetchMyWordsData();
            setMyWords(myWords);
        }
        fetchData();
    }, []);

    const dayCards = myWords.map(item => <DayCard data={item}/>);

    return(
        <div className='home_page'>
            {dayCards}
        </div>
    );
}

export default HomePage;
