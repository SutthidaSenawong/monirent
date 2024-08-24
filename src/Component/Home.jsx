import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <h1>Home is here</h1>
      <Link to="/monitors">Rent Now</Link>
    </div>
  );
}
