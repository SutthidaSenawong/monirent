import React from 'react';
import { Link } from 'react-router-dom';
import { getMonitors } from '../api';

import Slide from './Slide';

export default function Monitors() {
  const [monitors, setMonitors] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function loadMonitors() {
      setLoading(true);
      try {
        const data = await getMonitors();
        setMonitors(data);
        console.log(monitors.imageUrl);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    loadMonitors();
  }, []);

  const monitorsElements = monitors.map((monitor) => (
    <div key={monitor.id}>
      <Link to={`/rent-monitors-chiangmai/${monitor.id}`}>
        <div className="monitor-container">
          <img
            src={`${monitor.imageUrl}`}
            alt={monitor.name}
            className="monitor-img"
          />

          <div>
            <h3>{monitor.name}</h3>
            <p>{monitor.description}</p>
            <p>
              <span>{monitor.price} THB</span>/week
            </p>
          </div>
        </div>
      </Link>
    </div>
  ));

  if (loading) {
    return <h1>Loading...</h1>;
  }
  if (error) {
    return <h1>There was an error: {error.message}</h1>;
  }
  return (
    <>
      <Slide />
      <h1>Monitors For Rent in Chiang Mai </h1>
      <div className="all-monitors">{monitorsElements}</div>
    </>
  );
}
