import React from 'react';
import Logo from '../assets/MoniRent-logo.png';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <div className="nav">
      <Link to="/rent-monitors-chiangmai">
        <img src={Logo} />
      </Link>
    </div>
  );
}
