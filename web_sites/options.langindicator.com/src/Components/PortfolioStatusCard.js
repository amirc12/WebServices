import { useState, useEffect } from 'react';
import utils from '../utils';

const constants = require("../constants");

function extractTradeFromDataRecord(record)
{
    const trade = utils.extractTradeFromDataRecord(record);

    const rev = (record.current_stock_price - record.price) + (record.premium - record.current_call_price) + record.dividend;
    const currentRev = (rev / record.price * 100).toFixed(2);
    const stockPriceChange = (record.current_stock_price / record.price * 100 - 100).toFixed(2);

    trade.stockPrice       = record.current_stock_price;
    trade.stockPriceChange = stockPriceChange;
    trade.optionPrice      = record.current_call_price;
    trade.optionPriceType  = record.call_price_type;
    trade.currentRev       = currentRev;

    return trade;
}

async function fetchPortfolioStatusData()
{
    const url      = `${constants.API_URL}/portfolio-status?q=amir`;
    const response = await fetch (url, constants.FETCH_OPTIONS);
    const data     = await response.json();

    let trades = [];
    for(const record of data)
    {
        const trade = extractTradeFromDataRecord(record);
        trades.push(trade);
    }

    return trades;
}

function TradeStatusHeader()
{
    return(
        <tr>
            <th>Date</th>
            <th>Symbol</th>
            <th>Price</th>
            <th>Strike</th>
            <th>Change %</th>
            <th>Premium</th>
            <th>Premium %</th>
            <th>Dividend</th>
            <th>OTM</th>
            <th>ITM</th>
            <th>Exp Date</th>
            <th class="th_green">Stock Price</th>
            <th class="th_green">Change %</th>
            <th class="th_green">Option Price</th>
            <th class="th_green">Type</th>
            <th class="th_green">Current Rev %</th>
        </tr>
    );
}

function TradeStatusRow({trade})
{
    return(
        <tr>
            <td>{trade.date}</td>
            <td>{trade.symbol}</td>
            <td>{trade.price}$</td>
            <td>{trade.strike}$</td>
            <td>{trade.strikeChange}%</td>
            <td>{trade.premium}$</td>
            <td>{trade.premiumChange}%</td>
            <td>{trade.dividend}$</td>
            <td>{trade.otm}%</td>
            <td>{trade.itm}%</td>
            <td>{trade.expDate}</td>
            <td>{trade.stockPrice}</td>
            <td>{trade.stockPriceChange}%</td>
            <td>{trade.optionPrice}</td>
            <td>{trade.optionPriceType}</td>
            <td>{trade.currentRev}%</td>
        </tr>
    );
}

function PortfolioStatusCard()
{
    const [portfolioTrades, setPortfolioTrades] = useState([]);

    useEffect(() => 
    {
        async function fetchData() 
        {
            const trades = await fetchPortfolioStatusData();
            setPortfolioTrades(trades);
        }
        fetchData();
    }, []);

    const tradeStatusRows = portfolioTrades.map(trade => <TradeStatusRow trade={trade}/>);

    return(
        <div>
            {(portfolioTrades.length === 0)
            ?   <div>Loading...</div>
            :   <div style={{marginTop: '10px', marginBottom: '20px', overflow: 'auto'}}>
                    <table>
                        <TradeStatusHeader />
                        {tradeStatusRows}
                    </table>
                </div>
            }
        </div>);
}

export default PortfolioStatusCard;
