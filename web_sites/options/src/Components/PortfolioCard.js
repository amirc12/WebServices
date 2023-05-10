import { useState, useEffect } from 'react';
import utils from '../utils';

const constants = require("../constants");

async function fetchPortfolioData()
{
    const url      = `${constants.API_URL}/portfolio?q=amir`;
    const response = await fetch (url, constants.FETCH_OPTIONS);
    const data     = await response.json();

    let trades = [];
    for(const record of data)
    {
        const trade = utils.extractTradeFromDataRecord(record);
        trades.push(trade);
    }

    return trades;
}

function TradeRow({trade})
{
    return(
        <tr>
            <td>{trade.date}</td>
            <td>{trade.symbol}</td>
            <td>{trade.price}$</td>
            <td>{trade.shares}</td>
            <td>{trade.cost}$</td>
            <td>{trade.strike}$</td>
            <td>{trade.strikeChange}%</td>
            <td>{trade.premium}$</td>
            <td>{trade.premiumChange}%</td>
            <td>{trade.dividend}$</td>
            <td>{trade.otm}%</td>
            <td>{trade.otmYearly}%</td>
            <td>{trade.itm}%</td>
            <td>{trade.itmYearly}%</td>
            <td>{trade.expDate}</td>
        </tr>
    );
}

function TradeHeader()
{
    return(
        <tr>
            <th>Date</th>
            <th>Symbol</th>
            <th>Price</th>
            <th>Shares</th>
            <th>Cost</th>
            <th>Strike</th>
            <th>Change %</th>
            <th>Premium</th>
            <th>Premium %</th>
            <th>Dividend</th>
            <th>OTM</th>
            <th>Yearly</th>
            <th>ITM</th>
            <th>Yearly</th>
            <th>Exp Date</th>
        </tr>
    );
}

function PortfolioCard({onPortfolioLoad})
{
    const [portfolioTrades, setPortfolioTrades] = useState([]);

    useEffect(() => 
    {
        async function fetchData() 
        {
            const trades = await fetchPortfolioData();
            setPortfolioTrades(trades);
            onPortfolioLoad(true);
        }
        fetchData();
    }, []);

    const tradeRows = portfolioTrades.map(trade => <TradeRow trade={trade}/>);

    return(
        <div style={{marginBottom: '25px'}}>
            {(portfolioTrades.length === 0)
            ?   <div>Loading...</div>
            :   <div style={{marginTop: '15px'}}>
                    <table>
                        <TradeHeader />
                        {tradeRows}
                    </table>
                </div>
            }
        </div>);
}

export default PortfolioCard;
