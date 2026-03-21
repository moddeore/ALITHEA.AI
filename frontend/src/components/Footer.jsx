import logo from '../assets/websitelogo.png';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer fade-in">
      <div className="footer-content">
        <div className="footer-brand">
          <img src={logo} alt="ALITHEA.AI Logo" className="brand-logo" />
          <span>ALITHEA.AI</span>
        </div>
        <p className="copyright">
          &copy; {currentYear} ALITHEA.AI. All rights reserved.
        </p>
        <p className="footer-tagline">
          Empowering users to navigate the digital world with confidence.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
