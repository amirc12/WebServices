import './App.css';
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import HomePage from './Pages/HomePage'
import EditPage from './Pages/EditPage'
import DetailsPage from './Pages/DetailsPage'
import NewDetailsPage from './Pages/NewDetailsPage'

function PageHeader({currentPage, onShowHistory})
{
    return(
        <div className='page_header'>
            <header>        
                <div className="logo">
                    <div>My Words</div>
                </div>
                <div className="topnav">
                    <div><NavLink to="/">Brief</NavLink ></div>
                    <div><NavLink to="/editor">New Brief</NavLink ></div>
                    <div><NavLink to="/details">Details</NavLink ></div>
                    <div><NavLink to="/new_details">New Details</NavLink ></div>
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
                    <Route path="/details" element={<DetailsPage/>} />
                    <Route path="/new_details" element={<NewDetailsPage/>} />
                </Routes>
            </BrowserRouter>
        </div>
      );    
}

export default App;
