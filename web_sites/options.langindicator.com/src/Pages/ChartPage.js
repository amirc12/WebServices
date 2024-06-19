import './Pages.css';

import { useState } from 'react';
import ChartCard from '../Components/ChartCard'

const SYMBOLS = 
[
   "AAPL", "ABBV", "AMZN", "ARCC", "AVGO", "CAT", "CM", "CSCO", "FRT", "GOOG", "INTC", "KO", "KR", "LYB", "MCHP", "META", "MFC", "MMM", 
   "MRK", "MSFT", "NFG", "NUE", "NXPI", "ORI", "PRU", "RS", "STLD", "SYY", "TPVG", "VALE", "VICI", "VLO", "WPC", "WSBC", "XOM"
];

const styles =
{
    symbolInput  : {height: '25px', width: '60px', textTransform: 'uppercase'},
    filterInput  : {height: '25px', width: '40px'}
};

function InputField({style=styles.filterInput, onChangeHandler, value=''})
{
    return(<input style={style} type="text" value={value} onChange={(e) => onChangeHandler(e.target.value)}></input>);
}

function ChartPage()
{
    const [inputSymbol, setInputSymbol]       = useState('');
    const [showFilter, setShowFilter]         = useState(false);
    const [cardSymbols, setCardSymbols]       = useState([]);
    const [fromMonth, setFromMonth]           = useState(5);
    const [toMonth, setToMonth]               = useState(13);
    const [maxPriceChange, setMaxPriceChange] = useState(150);

    const symbolsButtons = SYMBOLS.map(symbol => <button onClick={() => setCardSymbols([...cardSymbols, symbol])}>{symbol}</button>);

    const chartCards = cardSymbols.map(symbol => <ChartCard symbol={symbol} fromMonth={fromMonth} toMonth={toMonth} maxPriceChange={maxPriceChange}/>);

    const filterButtonText = showFilter ? "Hide Filter" : "Show Filter";

    return(
        <div className='home_page'>
            <div className='filter_bar'>
                <div style={{alignSelf: 'center'}}>
                    Stock: <InputField style={styles.symbolInput} value={inputSymbol} onChangeHandler={setInputSymbol} />
                    <button class="action_button" onClick={() => setCardSymbols([...cardSymbols, inputSymbol])}>Run</button>
                    <button class="action_button" onClick={() => setShowFilter(!showFilter)}>{filterButtonText}</button>
                </div>
                <div style={{alignSelf: 'center'}}>
                    <button class="action_button" onClick={() => setCardSymbols([])}>Clear</button>
                </div>
            </div>

            {showFilter &&
                <div class="filter_form">
                    <div>From: <InputField value={fromMonth} onChangeHandler={setFromMonth} /> to <InputField value={toMonth} onChangeHandler={setToMonth}/> Months.</div>                    
                    <div>Max Price Change: <InputField value={maxPriceChange} onChangeHandler={setMaxPriceChange} /> %</div>
                </div>
            }

            <div className='symbols_list'>
                {symbolsButtons}
            </div>

            <div className='chart_cards_container'>
                {chartCards}
            </div>
        </div>
    );
}

export default ChartPage;
