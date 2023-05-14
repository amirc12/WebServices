import './App.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link } from "react-router-dom";
import HomePage from './Pages/HomePage'
import EditorPage from './Pages/EditorPage'

function PageHeader({currentPage, clickHandler})
{
    return(
        <header>        
            <div class="logo">
                <div>SHIRCO STUDIO</div>
            </div>
            <div class="topnav">
                {/* <div class={(currentPage === "home")   ? "active" : ""} onClick={() => clickHandler("home")}>Home</div> */}
                {/* <div class={(currentPage === "editor") ? "active" : ""} onClick={() => clickHandler("editor")}>Editor</div> */}
                <div><NavLink to="/">Home</NavLink ></div>
                {/* <div><NavLink to="/editor">Editor</NavLink ></div> */}
            </div>
        </header>
    );
}

function App() 
{
    const [currentPage, setCurrentPage] = useState("editor");

    return (
        <div className="App">
            <BrowserRouter>
                <PageHeader currentPage={currentPage} clickHandler={setCurrentPage}/>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/editor" element={<EditorPage />} />
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
