import { useState } from 'react';
import HistoryCard from '../Components/HistoryCard'

function AlgoTradePage()
{
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

    return(
        <div>
            <div>* Change is measured compared to previous day close price.</div>
            <HistoryCard onHistoryLoad={setIsHistoryLoaded}/>
        </div>);
}

export default AlgoTradePage;
