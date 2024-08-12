import React from 'react';
import { FaFacebookSquare } from 'react-icons/fa';
import { BsInstagram } from 'react-icons/bs';

export default function Footer() {
  return (
    <div className="footer">
      <a
        href="https://www.facebook.com/profile.php?id=61560818636615"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaFacebookSquare className="social-icon" />
      </a>
      <a
        href="https://www.instagram.com/monirent_cnx/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <BsInstagram className="social-icon" />
      </a>
    </div>
  );
}
