import './HomePage.css';
import { useState, useEffect } from 'react';
import utils from '../utils';

const moment = require("moment");

const colors   = ['#014361', '#375b39', '#824d4c', '#663c00'];
const bgColors = ['#e5f6fd', '#edf7ed', '#fdeded', '#fff4e5'];

function WordSeries({index, data})
{
    const words = data.map((item) => item.length ? <div className='single_word'>{item}</div> : '');

    return(
        <div className='word_series' style={{backgroundColor: bgColors[index % 4], color: colors[index % 4]}}>
            {words}
        </div>
    );
}

function DayCard({data})
{
    const series = data.series.map((item, index) => 
    {
        let isEmpty = true;
        for(const word of item)
        {
            if(word.length > 0)
                isEmpty = false;
        }

        return !isEmpty ? <WordSeries index={index} data={item}/> : '';
    });

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
            const myWords = await utils.fetchMyWordsData();
            setMyWords(myWords);
        }
        fetchData();
    }, []);

    const tomorrow = moment().add(1, 'day').format('DD/MM/YYYY');

    const dayCards = myWords.map(item => (item.date != tomorrow) ? <DayCard data={item}/> : '');

    return(
        <div className='home_page'>
            {dayCards}
        </div>
    );
}

export default HomePage;
