import './App.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link, useLocation } from "react-router-dom";
import Button from '@mui/material/Button';
import HomePage from './Pages/HomePage'
import EditorPage from './Pages/EditorPage'

function PageHeader({currentPage, onShowHistory})
{
    const location = useLocation();

    return(
        <div style={{backgroundColor: 'rgb(249, 182, 94)'}}>
            <header>        
                <div className="logo">
                    <div>SHIRCO STUDIO</div>
                </div>
                <div className="topnav">
                    {/* <div class={(currentPage === "home")   ? "active" : ""} onClick={() => clickHandler("home")}>Home</div> */}
                    {/* <div class={(currentPage === "editor") ? "active" : ""} onClick={() => clickHandler("editor")}>Editor</div> */}
                    <div><NavLink to="/">Home</NavLink ></div>
                    {/* <div><NavLink to="/editor">Editor</NavLink ></div> */}
                    {location.pathname === '/editor' && <Button style={{height: '25px', marginLeft: '5px', margin: '5px', backgroundColor: 'white', color: 'rgb(231, 24, 115)'}} variant="outlined" onClick={onShowHistory}>History</Button>}
                </div>
            </header>
        </div>
    );
}

function App() 
{
    const [currentPage, setCurrentPage] = useState("editor");
    const [showHistory, setShowHistory] = useState(false);

    return (
        <div className="App">
            <BrowserRouter>
                <PageHeader currentPage={currentPage} onShowHistory={() => setShowHistory(!showHistory)}/>
                <Routes>
                    <Route path="/"       element={<HomePage showHistory={showHistory}/>} />
                    <Route path="/editor" element={<EditorPage showHistory={showHistory}/>} />
                </Routes>
            </BrowserRouter>
        </div>
      );    
    // return(
    //     <div className="App">
    //         <PageHeader currentPage={currentPage} clickHandler={setCurrentPage}/>
    //         {currentPage === "home"      && <HomePage />}
    //         {currentPage === "editor"    && <EditorPage />}
    //     </div>
    // );
}

export default App;
