import './App.css';
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import HomePage from './Pages/HomePage'
import EditPage from './Pages/EditPage'

function PageHeader({currentPage, onShowHistory})
{
    return(
        <div className='page_header'>
            <header>        
                <div className="logo">
                    <div>My Words</div>
                </div>
                <div className="topnav">
                    <div><NavLink to="/">Home</NavLink ></div>
                    <div><NavLink to="/editor">Add Words</NavLink ></div>
                </div>
            </header>
        </div>
    );
}

function App() 
{
    return (
        <div className="App">
            <BrowserRouter>
                <PageHeader/>
                <Routes>
                    <Route path="/"       element={<HomePage/>} />
                    <Route path="/editor" element={<EditPage/>} />
                </Routes>
            </BrowserRouter>
        </div>
      );    
}

export default App;
