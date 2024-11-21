import 'react';
//import { BrowserRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';

const NavMenu = () => {
    return (
        
        <nav className="navbar navbar-expand-lg navbar-black bg-dark">
            <ul className="navbar-nav">
                <li className="nav-item">
                    <Link className="nav-link" to="/customer">Customer</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/product">Product</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/store">Store</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/sales">Sales</Link>
                </li>
            </ul>
            </nav>
        
    );
};

export default NavMenu;
