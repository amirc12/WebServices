import './App.css';
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import HomePage from './Pages/HomePage'
import PortfolioPage from './Pages/PortfolioPage'

function PageHeader()
{
    return(
        <div className='page_header'>
            <header>        
                <div className="logo">
                    <div>Options Investment</div>
                </div>
                <div className="topnav">
                    <div><NavLink to="/">Home</NavLink ></div>
                    <div><NavLink to="/portfolio">Portfolio</NavLink ></div>
                </div>
            </header>
        </div>
    );
}

function PageContent()
{
    return(
        <div className='page_content'>
            <Routes>
                <Route path="/"          element={<HomePage/>} />
                <Route path="/portfolio" element={<PortfolioPage/>} />
            </Routes>
        </div>
    );
}

function App() 
{
    return(
        <div>
            <BrowserRouter>
                <PageHeader/>
                <PageContent />
            </BrowserRouter>
        </div>
    );    
}

export default App;
