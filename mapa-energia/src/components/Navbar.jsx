import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import docLogo from '../assets/doc.svg';
import teamLogo from '../assets/team.svg';

function Navbar() {
  const navigate = useNavigate();
  const driveDocUrl = "https://drive.google.com/file/d/1U1aOW3Y6oZgD-em1c0TSS9sWm_B0uIlI/view?usp=sharing"; 

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ marginRight: '10px' }}
            className="text-accent-blue"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          
          <span>
            Proyecto SIG // <span className="text-accent-blue">Red Energética</span>
          </span>
        </Link>
      </div>

      <div className="navbar-links">
        <Button text='Equipo' onClick={() => navigate('/equipo')} icon={<img src={teamLogo} alt="doc" style={{ width: '24px', height: '24px' }} />} />
        <Button text='Documentación' onClick={() => window.open(driveDocUrl, "_blank")} icon={<img src={docLogo} alt="doc" style={{ width: '20px', height: '20px' }} />} />
      </div>
    </nav>
  );
}

export default Navbar;