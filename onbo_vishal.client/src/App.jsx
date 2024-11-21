import NavMenu from './navmenu/navmenu.jsx';
import './App.css';
import './style.css';
import Customer from './components/Customer';
import Product from './components/Product';
import Sales from './components/Sales';
import Store from './components/Store';
import { Routes, Route } from 'react-router-dom';


function App() {
    return (
        
        <div>
            <NavMenu />
            <Routes>
                <Route path="/" element={<Customer />} />
                <Route path="/customer" element={<Customer />} />
                <Route path="/product" element={<Product />} />
                <Route path="/store" element={<Store />} />
                <Route path="/sales" element={<Sales />} />

             
            </Routes>
               
            
            </div>
        
    );
}

export default App;
