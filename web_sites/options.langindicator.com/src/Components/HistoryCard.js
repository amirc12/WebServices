import { useState, useEffect } from 'react';
import utils from '../utils';

const constants = require("../constants");

async function fetchHistoricalData()
{
    const url      = `${constants.API_URL}/history?q=amir`;
    const response = await fetch (url, constants.FETCH_OPTIONS);
    const data     = await response.json();

    // let trades = [];
    // for(const record of data)
    // {
    //     const trade = utils.extractTradeFromDataRecord(record);
    //     trades.push(trade);
    // }

    return data;
}

function PriceRow({price, index})
{
    const percentChange = (price.percentChange * 100).toFixed(2);
    
    // const bgColor = (index % 2) ? 'rgb(245, 245, 245)' : 'white';
    const className = price.change > 0 ? "history_tr_green" : "history_tr_red";

    return(
        // <tr style={{backgroundColor: bgColor}}>
        <tr class={className}>
            <td>{price.dateStr}</td>
            <td>{price.open}</td>
            <td>{price.close}</td>
            <td>{price.change}</td>
            <td>{percentChange}%</td>
            <td>{price.revenue}</td>
        </tr>
    );
}

function PriceHeader()
{
    return(
        <tr>
            <th>Date</th>
            <th>open</th>
            <th>Close</th>
            <th>Change</th>
            <th>Change %</th>
            <th>Revenue</th>
        </tr>
    );
}

function HistoryCard({onHistoryLoad})
{
    const [prices, setPrices] = useState([]);

    useEffect(() => 
    {
        async function fetchData() 
        {
            const prices = await fetchHistoricalData();
            setPrices(prices);
            onHistoryLoad(true);
        }
        fetchData();
    }, []);

    const priceRows = prices.map((price, index) => <PriceRow price={price} index={index}/>);

    return(
        <div style={{marginBottom: '25px'}}>
            {(prices.length === 0)
            ?   <div>Loading...</div>
            :   <div style={{marginTop: '15px', overflow: 'auto'}}>
                    <table>
                        <PriceHeader />
                        {priceRows}
                    </table>
                </div>
            }
        </div>);
}

export default HistoryCard;
