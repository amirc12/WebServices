const SYMBOLS = 
[
   "AAPL", "AMZN", "AVGO", "CAT", "CM", "CSCO", "EPD", "FRT", "GOOG", "INTC", "KO", "LYB", "META", "MFC", "MMM", 
   "MMP", "MPLX", "MSFT", "NFG", "NUE", "ORI", "PRU", "STLD", "STOR", "SYY", "VALE", "WPC", "WSBC", "XOM"
];

// const API_URL = "http://localhost:5000/finance";
// const API_URL = "http://langindicator.com/finance";
const API_URL = "https://langindicator.com/finance";

const OPTIONS =
{
    method:  "GET",
    headers: {}
};

let stockButtons = document.getElementById("stock_buttons");

for(let symbol of SYMBOLS)
{
    const button = document.createElement("button");
    button.style = "padding: 5px; margin: 5px;";
    button.innerText = symbol;

    button.addEventListener("click", () => GetStockInfo(symbol.toUpperCase()));
    
    stockButtons.appendChild(button);
}    

var input = document.getElementById("symbol_input");

// Execute a function when the user presses a key on the keyboard
input.addEventListener("keypress", function(event) 
{
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") 
    {
        // Cancel the default action, if needed
        event.preventDefault();
    

        // Trigger the button element with a click
        document.getElementById("run_button").click();
    }
});

async function OnDateButtonClick(container, symbol, date, price, divToPay)
{
    container.innerHTML = '';
    container.innerText = 'Loading...'

    const url    = `${API_URL}/options?q=${symbol}&date=${date}`;
    let response = await fetch (url, OPTIONS);
    let data     = await response.json();

    const table = document.createElement("table");
    const tableHeader = document.createElement("tr");
    tableHeader.innerHTML = '<th>Strike</th><th>Price Change</th><th>Premium (%)</th><th>OTM</th><th>ITM</th>';
    table.appendChild(tableHeader);

    const maxPriceChange = document.getElementById("max_price_change").value / 100;

    for(const call of data.contracts.calls)
    {
        if(call.strike.raw / price > 1 && call.strike.raw / price <= maxPriceChange)
        {
            const premium = call.bid.raw ? call.bid.raw : call.lastPrice.raw;
            const premiumP = (premium / price * 100).toFixed(2);
            const otm = ((premium + divToPay) / price * 100).toFixed(2);
            const itm = ((call.strike.raw - price + premium + divToPay) / price * 100).toFixed(2);
            const priceChange = ((call.strike.raw / price - 1) * 100).toFixed(2);
            const line = `${call.strike.raw}, ${priceChange}, ${premium}, ${otm}, ${itm}`

            const row = document.createElement("tr");
            row.innerHTML = `<td>${call.strike.raw}$</td><td>${priceChange}%</td><td>${premium}$ (${premiumP}%)</td><td>${otm}%</td><td>${itm}%</td>`;
            table.appendChild(row);
        }
    }

    container.innerHTML = '';
    container.appendChild(table);
}

function CreateStockInfoCard()
{
    let card = document.createElement("div");
    card.className = "card";

    let title = document.createElement("div");
    title.className = "title";
    title.id = "card_title";

    let content = document.createElement("div");
    content.className = "content";
    content.id = "card_content";

    card.appendChild(title);
    card.appendChild(content);

    return card;
}

async function GetStockInfo(symbol)
{
    let stockContainer = document.getElementById("stock_container");

    let stockCard = CreateStockInfoCard();
    stockContainer.appendChild(stockCard);
    // let stockInfo = document.getElementById("stock_info");
    // stockInfo.style = "display: block;"

    // const title = document.getElementById("card_title");
    const title = stockCard.firstChild;
    title.innerText = 'Loading...'

    // const content = document.getElementById("card_content");
    const content = stockCard.lastChild;
    content.innerHTML = '';

    let url   = `${API_URL}/stock-info?q=${symbol}`;
    let response = await fetch (url, OPTIONS);
    let data     = await response.json();

    const price = data.price.regularMarketPrice.fmt;
    const divRate = data.summaryDetail.dividendRate.fmt ? data.summaryDetail.dividendRate.fmt : 0;
    const divYield = data.summaryDetail.dividendYield.fmt ? data.summaryDetail.dividendYield.fmt : 0;

    // title.innerText = `Stock: ${symbol}, Price: ${price}$, Div Yield: ${divYield}, Div Rate: ${divRate}$, Payout Ratio: ${data.summaryDetail.payoutRatio.fmt}, Beta: ${data.summaryDetail.beta.fmt}`;
    const table = document.createElement("table");
    table.className = "title_table";
    const tableHeader = document.createElement("tr");
    tableHeader.innerHTML = '<th>Stock</th><th>Price</th><th>Div Yield</th><th>Div Rate</th><th>Pay Ratio</th><th>Beta</th>';
    table.appendChild(tableHeader);
    const row = document.createElement("tr");
    row.innerHTML = `<td>${symbol}</td><td>${price}$</td><td>${divYield}</td><td>${divRate}$</td><td>${data.summaryDetail.payoutRatio.fmt}</td><td>${data.summaryDetail.beta.fmt}</td>`;
    table.appendChild(row);
    title.innerHTML = '';
    title.appendChild(table);

    content.innerText = 'Loading Calls Contracts...';

    url   = `${API_URL}/options?q=${symbol}`;
    response = await fetch (url, OPTIONS);
    data     = await response.json();

    content.innerHTML = '';
    let dateButtons = document.createElement("div");

    const currentTS = Math.floor(Date.now() / 1000);
    const monthSeconds = 2629743;

    const fromMonth = document.getElementById("from_month").value;
    const toMonth = document.getElementById("to_month").value;
    
    for(const date of data.meta.expirationDates)
    {
        const dif = date - currentTS;
        if(dif >= monthSeconds * fromMonth && dif <= monthSeconds * toMonth)
        {
            const div = document.createElement("div");
            div.style = "padding-bottom: 10px; margin-top: -4px;";

            const button = document.createElement("button");
            const dateStr = new Date(date * 1000).toLocaleDateString();
            const difMonth = Math.floor(dif / monthSeconds);
            const divToPay = Math.floor(difMonth / 3) / 4 * divRate;
            button.innerText = `${dateStr} (${difMonth} months) (Div Est: ${divToPay.toFixed(2)}$)`;

            button.addEventListener("click", () => OnDateButtonClick(div, symbol, date, price, divToPay));
            
            dateButtons.appendChild(button);
            dateButtons.appendChild(div);
        }
    }

    content.appendChild(dateButtons);
}

function OnRunButtonClick()
{
    const symbol = document.getElementById("symbol_input").value;
    GetStockInfo(symbol.toUpperCase());
}

function OnClearButtonClick()
{
    let stockContainer = document.getElementById("stock_container");
    stockContainer.innerHTML = '';
}

function OnFilterButtonClick()
{
    const filter = document.getElementById("filter_fields");
    filter.style.display = (filter.style.display === "grid") ? "none" : "grid";
}