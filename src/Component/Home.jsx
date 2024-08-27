import React from 'react';
import { Link } from 'react-router-dom';
import CNX from '../assets/CNX.png';

export default function Home() {
  return (
    <div className="home-container">
      <img src={CNX} alt="CNX image" className="home-responsive-img" />
      <div className="home-text-content">
        <h1>
          <strong>
            Rent <br />
            Monitors <br />
            Chiang Mai
          </strong>
        </h1>
        <h2>Complete your dream remote workspace with Monirent.</h2>
        <p>
          Looking for a monitor rental in Chiang Mai? You've come to the right
          place!
        </p>
        <Link to="/rent-monitors-chiangmai" className="rent-btn">
          Rent Now
        </Link>
      </div>
    </div>
  );
}
