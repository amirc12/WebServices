import './Cards.css';
import { useState, useEffect } from 'react';
import { Chart } from "react-google-charts";

const constants = require("../constants");

const MONTH_SECONDS = 2629743;

async function fetchStockInfo(symbol)
{
    const url      = `${constants.API_URL}/stock-info?q=${symbol}`;
    const response = await fetch (url, constants.FETCH_OPTIONS);
    const data     = await response.json();

    const price       = data.regularMarketPrice.toFixed(2);
    const priceChange = data.regularMarketChangePercent.toFixed(2);
    const divRate     = data.dividendRate  ? data.dividendRate  : 0;
    const divYield    = data.dividendYield ? data.dividendYield : 0;
    const payoutRatio = (data.dividendRate / data.epsCurrentYear * 100).toFixed(2);
    const beta        = data.beta ? data.beta.toFixed(2) : 0;

    const ret = {symbol: symbol, price: price, priceChange: priceChange, divRate: divRate, divYield: divYield, payoutRatio: payoutRatio, beta: beta};
    
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

    const strikeRows = contractStrikes.map((strike) => <tr><td>{strike.strike}</td><td>{strike.priceChange}%</td><td>{strike.premiumStr}</td><td>{strike.otm}%</td><td>{strike.itm}%</td></tr>);

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

function buildChartData(chartData, isPercents, stockInfo)
{
    //First set the header of the chart data
    let data = [["Strike"]];
    for(const key in chartData)
    {
        const dateStr   = new Date(key * 1000).toLocaleDateString();
        data[0].push(dateStr);
    }

    //Then add the data itself
    let rows = {};

    let zeroLine = [];
    for(let i = 0; i < Object.keys(chartData).length; i++)
        zeroLine.push(null);

    let i = 0;
    for(const key in chartData)
    {
        for (const record of chartData[key])
        {
            if(!rows.hasOwnProperty(`${record.strike}`))
                rows[`${record.strike}`] = [...zeroLine]; //[];

            const value = isPercents ? record.premium / stockInfo.price * 100 : record.premium

            // rows[`${record.strike}`].push(value);
            rows[`${record.strike}`][i] = value;
        }

        i++;
    }

    for(const strike in rows)
    {
        let row = [strike, ...rows[strike]];
        data.push(row);
    }

    data = data.sort(function(a, b) {return a[0] - b[0]});

    return data;
}

function ChartCard({dates, stockInfo, maxPriceChange})
{
    const [isLoading, setIsLoading] = useState(false);
    const [chartData, setChartData] = useState({});
    const [isPercents, setIsPercents] = useState(false);

    async function handleClick()
    {
        setIsLoading(true);

        const currentTS = Math.floor(Date.now() / 1000);

        let datesStrikes = {};
        for(const date of dates)
        {
            const dif       = date - currentTS;
            const difMonth  = Math.floor(dif / MONTH_SECONDS);
            const divToPay  = Math.floor(difMonth / 3) / 4 * stockInfo.divRate;
        
            const strikes = await fetchContractStrikes(date, stockInfo, maxPriceChange, divToPay);
            datesStrikes[`${date}`] = strikes;
        }

        setChartData(datesStrikes);
    }

    const vAxisTitle = isPercents ? "Premium %" : "Premium";
    const chartOptions = 
    {
        width       : "100%",
        height      : "500px",
        title       : 'Premium By Expiration Date',
        pointShape  : 'circle',
        pointSize   : 5,
        hAxis       : {title: "Strike"},
        vAxis       : {title: vAxisTitle},
    };

    const data = buildChartData(chartData, isPercents, stockInfo);

    return(
        <div style={{borderTop: "1px solid gray"}}>
            <button class="action_button" onClick={handleClick}>CHART</button>
            <button class="action_button" onClick={() => setIsPercents(!isPercents)}>%</button>
            {(Object.keys(chartData).length > 0)
            ?   <div style={{padding: "0 10px 5px"}}>
                <Chart
                    chartType = "LineChart"
                    data    = {data}
                    options = {chartOptions}
                />
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

    const priceChangeStyle = stockInfo.priceChange > 0 ? {color: 'green'} : {color: 'red'};

    return(
        <div className='stock_card'>
            {stockInfo.price === 0 ? <div>Loading..</div> :
                <div>
                    <table className='title_table'>
                        <tr><th>Stock</th><th>Price</th><th>Change</th><th>Div Yield</th><th>Div Rate</th><th>Pay Ratio</th><th>Beta</th></tr>
                        <tr>
                            <td>{symbol}</td>
                            <td>{stockInfo.price}$</td>
                            <td style={priceChangeStyle}>{stockInfo.priceChange}%</td>
                            <td>{stockInfo.divYield}%</td>
                            <td>{stockInfo.divRate}$</td>
                            <td>{stockInfo.payoutRatio}%</td>
                            <td>{stockInfo.beta}</td>    
                        </tr>
                    </table>
                    {contractDates.length > 0  ? <div>{contractCards}</div> : <div>Loading Call Contracts...</div>}
                    {contractDates.length > 0  && <div><ChartCard dates={contractDates} stockInfo={stockInfo} maxPriceChange={maxPriceChange}/></div>}
                </div>
            }
        </div>); 
}

export default StockCard;
