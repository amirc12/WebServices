import './HomePage.css';

import { useState } from 'react';
import StockCard from '../Components/StockCard'

const SYMBOLS = 
[
   "AAPL", "AMZN", "AVGO", "CAT", "CM", "CSCO", "EPD", "FRT", "GOOG", "INTC", "KO", "LYB", "META", "MFC", "MMM", 
   "MMP", "MPLX", "MSFT", "NFG", "NUE", "ORI", "PRU", "STLD", "STOR", "SYY", "VALE", "WPC", "WSBC", "XOM"
];

const styles =
{
    symbolsList  : {padding: '10px', borderBottom: '1px solid gray'},
    symbolInput  : {height: '25px', width: '70px', textTransform: 'uppercase'},
    filterInput  : {height: '25px', width: '40px'}
};

function InputField({style=styles.filterInput, onChangeHandler, value=''})
{
    return(<input style={style} type="text" value={value} onChange={(e) => onChangeHandler(e.target.value)}></input>);
}

function HomePage()
{
    const [inputSymbol, setInputSymbol]       = useState('');
    const [showFilter, setShowFilter]         = useState(false);
    const [cardSymbols, setCardSymbols]       = useState([]);
    const [fromMonth, setFromMonth]           = useState(5);
    const [toMonth, setToMonth]               = useState(13);
    const [maxPriceChange, setMaxPriceChange] = useState(150);

    const symbolsButtons = SYMBOLS.map(symbol => <button onClick={() => setCardSymbols([...cardSymbols, symbol])}>{symbol}</button>);

    const stockCards = cardSymbols.map(symbol => <StockCard symbol={symbol} fromMonth={fromMonth} toMonth={toMonth} maxPriceChange={maxPriceChange}/>);

    const filterButtonText = showFilter ? "Hide Filter" : "Show Filter";

    return(
        <div>
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
                    
                    <div>From: <InputField value={fromMonth} onChangeHandler={setFromMonth} /> Months.</div>
                    <div>To: <InputField value={toMonth} onChangeHandler={setToMonth} /> Months.</div>
                    <div>Max Price Change: <InputField value={maxPriceChange} onChangeHandler={setMaxPriceChange} /> %</div>
                </div>
            }

            <div style={styles.symbolsList}>
                {symbolsButtons}
            </div>

            <div className='stock_cards_container'>
                {stockCards}
            </div>
        </div>
    );
}

export default HomePage;
