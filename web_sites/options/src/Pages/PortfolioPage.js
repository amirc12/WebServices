import { useState } from 'react';
import PortfolioCard from '../Components/PortfolioCard'
import PortfolioStatusCard from '../Components/PortfolioStatusCard'

function PortfolioPage()
{
    const [isPortfolioStatusLoading, setIsPortfolioStatusLoading] = useState(false); 
    const [isPortfolioLoaded, setIsPortfolioLoaded] = useState(false);

    return(
        <div>
            <PortfolioCard onPortfolioLoad={setIsPortfolioLoaded}/>

            {isPortfolioLoaded && <button class="action_button" onClick={() => setIsPortfolioStatusLoading(true)}>Get Current Status</button>}

            {isPortfolioStatusLoading && <PortfolioStatusCard />}
        </div>);
}

export default PortfolioPage;
