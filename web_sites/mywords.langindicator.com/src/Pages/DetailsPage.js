import './DetailsPage.css';
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

function WordCard({data, isExpanded})
{
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => 
    {
        setIsOpen(isExpanded);
    }, [isExpanded]);
    
    return(
        <div className='word_card'>
            <div className='word_title' onClick={() => setIsOpen(!isOpen)}>{data.word}</div>
            {isOpen && 
                <div className='word_details'> 
                    <div className='word_definition'>{data.definition}</div>
                    <div className='word_example'>{data.example}</div>
                </div>
            }
        </div>
    );
}

function DetailsPage()
{
    const [isExpandAll, setIsExpandAll] = useState(false);
    const [myWords, setMyWords] = useState([]);

    useEffect(() => 
    {
        async function fetchData() 
        {
            const myWords = await utils.fetchDetailsWordsData();
            setMyWords(myWords);
        }
        fetchData();
    }, []);

    const words = myWords.map((item) => <WordCard data={item} isExpanded={isExpandAll}/>);

    const buttonText = isExpandAll ? "Collapse All" : "Expand All";

    return(
        <div className='details_page'>
            <button onClick={() => setIsExpandAll(!isExpandAll)}>{buttonText}</button>
            {words}
        </div>
    );
}

export default DetailsPage;
