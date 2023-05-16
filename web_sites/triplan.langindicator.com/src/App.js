import './App.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink} from "react-router-dom";
import HomePage from './Pages/HomePage'
import EditorPage from './Pages/EditorPage'

function PageHeader()
{
    return(
        <header>        
            <div className="logo">
                <div>TRIP PLANNER</div>
            </div>
            <div className="topnav">
                <div><NavLink to="/">בית</NavLink ></div>
                <div><NavLink to="/editor">עריכה</NavLink ></div>
            </div>
        </header>
    );
}

function App() 
{
    return (
        <div className="App">
            <BrowserRouter>
                <PageHeader />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/editor" element={<EditorPage />} />
                </Routes>
            </BrowserRouter>
        </div>
      );    
}

export default App;
