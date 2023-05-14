import './StockCard.css';
import { useState, useEffect } from 'react';

const constants = require("../constants");

const MONTH_SECONDS = 2629743;

async function fetchStockInfo(symbol)
{
    const url      = `${constants.API_URL}/stock-info?q=${symbol}`;
    const response = await fetch (url, constants.FETCH_OPTIONS);
    const data     = await response.json();

    const price       = data.price.regularMarketPrice.fmt;
    const divRate     = data.summaryDetail.dividendRate.fmt  ? data.summaryDetail.dividendRate.fmt  : 0;
    const divYield    = data.summaryDetail.dividendYield.fmt ? data.summaryDetail.dividendYield.fmt : 0;
    const payoutRatio = data.summaryDetail.payoutRatio.fmt   ? data.summaryDetail.payoutRatio.fmt   : 0;
    const beta        = data.summaryDetail.beta.fmt          ? data.summaryDetail.beta.fmt          : 0;

    const ret = {symbol: symbol, price: price, divRate: divRate, divYield: divYield, payoutRatio: payoutRatio, beta: beta};
    return ret;
}

async function fetchContractDates(symbol, fromMonth, toMonth, maxPriceChange, divRate)
{
    const url      = `${constants.API_URL}/options?q=${symbol}`;
    const response = await fetch (url, constants.FETCH_OPTIONS);
    const data     = await response.json();

    const currentTS = Math.floor(Date.now() / 1000);

    let dates = [];
    for(const date of data.meta.expirationDates)
    {
        const dif = date - currentTS;
        if(dif >= MONTH_SECONDS * fromMonth && dif <= MONTH_SECONDS * toMonth)
            dates.push(date);
    }

    return dates;
}

async function fetchContractStrikes(date, stockInfo, maxPriceChange, divToPay)
{
    const url      = `${constants.API_URL}/options?q=${stockInfo.symbol}&date=${date}`;
    const response = await fetch (url, constants.FETCH_OPTIONS);
    const data     = await response.json();

    let strikes = [];
    for(const call of data.contracts.calls)
    {
        if( (call.strike.raw / stockInfo.price) > 1 && (call.strike.raw / stockInfo.price) <= (maxPriceChange / 100) )
        {
            const premium     = call.bid.raw ? call.bid.raw : call.lastPrice.raw;
            const premiumP    = (premium / stockInfo.price * 100).toFixed(2);
            const otm         = ((premium + divToPay) / stockInfo.price * 100).toFixed(2);
            const itm         = ((call.strike.raw - stockInfo.price + premium + divToPay) / stockInfo.price * 100).toFixed(2);
            const priceChange = ((call.strike.raw / stockInfo.price - 1) * 100).toFixed(2);
            const premiumStr  = `${premium}$ (${premiumP}%)`;

            strikes.push({strike: call.strike.raw, priceChange: priceChange, premium: premium, premiumP: premiumP, premiumStr: premiumStr, otm:otm, itm: itm});
        }
    }

    return strikes;
}

function ContractCard({date, stockInfo, maxPriceChange})
{
    const [isLoading, setIsLoading] = useState(false);
    const [contractStrikes, setContractStrikes] = useState([]);

    const currentTS = Math.floor(Date.now() / 1000);
    const dif       = date - currentTS;
    const dateStr   = new Date(date * 1000).toLocaleDateString();
    const difMonth  = Math.floor(dif / MONTH_SECONDS);
    const divToPay  = Math.floor(difMonth / 3) / 4 * stockInfo.divRate;

    async function handleClick()
    {
        setIsLoading(true);
        const strikes = await fetchContractStrikes(date, stockInfo, maxPriceChange, divToPay);
        setContractStrikes(strikes);
    }

    const strikeRows = contractStrikes.map((strike) => <tr><td>{strike.strike}</td><td>{strike.priceChange}%</td><td>{strike.premiumStr}</td><td>{strike.otm}</td><td>{strike.itm}</td></tr>);

    return(
        <div>
            <button onClick={handleClick}>{dateStr} ({difMonth} months) (Div Est: {divToPay.toFixed(2)}$)</button>
            {(contractStrikes.length > 0)
            ?   <div style={{padding: "0 10px 5px"}}>
                    <table>
                        <tr><th>Strike</th><th>Price Change</th><th>Premium (%)</th><th>OTM</th><th>ITM</th></tr>
                        {strikeRows}
                    </table>
                </div>
            :   isLoading && <div>Loading...</div>
            }
        </div>);
}

function StockCard({symbol, fromMonth, toMonth, maxPriceChange})
{
    const [stockInfo, setStockInfo] = useState({symbol: '', price: 0, divRate: 0, divYield: 0, payoutRatio: 0, beta: 0});
    const [contractDates, setContractDates] = useState([]);

    useEffect(() => 
    {
        async function fetchData() 
        {
            const stockInfo = await fetchStockInfo(symbol);
            setStockInfo(stockInfo);

            const dates = await fetchContractDates(symbol, fromMonth, toMonth);
            setContractDates(dates);
        }
        fetchData();
    }, []);

    const contractCards = contractDates.map(date => <ContractCard date={date} stockInfo={stockInfo} maxPriceChange={maxPriceChange}/>);

    return(
        <div className='stock_card'>
            {stockInfo.price === 0 ? <div>Loading..</div> :
                <div>
                    <table className='title_table'>
                        <tr><th>Stock</th><th>Price</th><th>Div Yield</th><th>Div Rate</th><th>Pay Ratio</th><th>Beta</th></tr>
                        <tr>
                            <td>{symbol}</td>
                            <td>{stockInfo.price}$</td>
                            <td>{stockInfo.divYield}</td>
                            <td>{stockInfo.divRate}$</td>
                            <td>{stockInfo.payoutRatio}</td>
                            <td>{stockInfo.beta}</td>    
                        </tr>
                    </table>
                    {contractDates.length > 0  ? <div>{contractCards}</div> : <div>Loading Call Contracts...</div>}
                </div>
            }
        </div>); 
}

export default StockCard;
