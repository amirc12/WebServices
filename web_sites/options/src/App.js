import './App.css';
import { useState } from 'react';
import HomePage from './Pages/HomePage'
import PortfolioPage from './Pages/PortfolioPage'

function Header({currentPage, clickHandler})
{
    return(
        <header>        
            <div class="logo">
                <div>Options Investment</div>
            </div>
            <div class="topnav">
                <div class={(currentPage === "home")      ? "active" : ""} onClick={() => clickHandler("home")}>Home</div>
                <div class={(currentPage === "portfolio") ? "active" : ""} onClick={() => clickHandler("portfolio")}>Portfolio</div>
            </div>
        </header>
    );
}

function App() 
{
    const [currentPage, setCurrentPage] = useState("home");

    return(
        <div className="App">
            <Header currentPage={currentPage} clickHandler={setCurrentPage}/>
            {currentPage === "home"      && <HomePage />}
            {currentPage === "portfolio" && <PortfolioPage />}
        </div>
    );
}

export default App;
