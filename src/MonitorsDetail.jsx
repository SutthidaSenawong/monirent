import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { getMonitor } from '../api';

export default function MonitorsDetail() {
  const [monitor, setMonitor] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const { id } = useParams();

  React.useEffect(() => {
    // fetch(`/api/monitors/${params.id}`)
    //   .then((res) => res.json())
    //   .then((data) => {
    //     // console.log('data', data)
    //     setMonitor(data.monitors);
    //   });
    async function loadMonitor() {
      setLoading(true);
      try {
        const data = await getMonitor(id);
        setMonitor(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    loadMonitor();
  }, [id]);

  if (loading) {
    return <h1>Loading...</h1>;
  }
  if (error) {
    return <h1>There was an error: {error.message}</h1>;
  }

  return (
    <div>
      {monitor && (
        <div>
          <Link to=".." relative="path">
            <p className="back-btn">
              <HiArrowNarrowLeft /> Back to all monitors
            </p>
          </Link>
          <div className="detail-responsive-container">
            <div className="monitor-detail-img-container">
              <img src={monitor.imageUrl} alt={monitor.name} />
            </div>
            <div className="detail-container">
              <div className="detail-top-container">
                <h2>{monitor.name}</h2>
                <p>{monitor.description}</p>
                <p className="price">
                  <span>{monitor.price} THB</span>/week
                </p>

                <a
                  href="http://m.me/280517075156100"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rent-btn"
                >
                  Rent this
                </a>
              </div>

              <div className="specifications">
                <h3>Specifications</h3>
                <p>{monitor.info}</p>
                <ul className="specifications-list">
                  {Object.entries(monitor.spec).map(([key, value]) => (
                    <li key={key}>
                      <div className="spec">
                        <strong>{key}:</strong> {value}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
