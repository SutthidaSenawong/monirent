import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <h1>Monitor for Rent in Chiang Mai</h1>
      <h2>Complete your dream remote workspace with Monirent.</h2>
      <p>
        Looking for a monitor rental in Chiang Mai? You've come to the right
        place!
      </p>
      <Link to="/rent-monitors-chiangmai">Rent Now</Link>
    </div>
  );
}
