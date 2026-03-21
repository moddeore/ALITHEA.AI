import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/websitelogo.png';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <img src={logo} alt="ALITHEA.AI Logo" className="brand-logo" />
          <span className="brand-name">ALITHEA.AI</span>
        </Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/image-detection" className={location.pathname === '/image-detection' ? 'active' : ''}>
            Image Detector
          </Link>
        </li>
        <li>
          <Link to="/text-detection" className={location.pathname === '/text-detection' ? 'active' : ''}>
            Text Detector
          </Link>
        </li>
        <li>
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
            About Us
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
