import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowNarrowLeft } from 'react-icons/hi';

export default function MonitorsDetail() {
  const [monitor, setMonitor] = React.useState(null);
  const params = useParams();

  React.useEffect(() => {
    fetch(`/api/monitors/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        // console.log('data', data)
        setMonitor(data.monitors);
      });
  }, [params.id]);
  return (
    <div>
      {monitor ? (
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

                <a className="rent-btn">Rent this monitor</a>
              </div>

              <div className="specifications">
                <h3>Specifications</h3>
                <p>{monitor.info}</p>
                <ul className="specifications-list">
                  {monitor.spec.map((spec, index) => (
                    <li key={index}>
                      {Object.entries(spec).map(([key, value]) => (
                        <div key={key} className="spec">
                          <strong>{key}</strong> {value}
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <h2>Loading...</h2>
      )}
    </div>
  );
}
