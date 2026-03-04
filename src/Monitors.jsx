import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { IoMdAdd } from 'react-icons/io';
import useCart from './lib/cart';

import Slide from './Slide';
import { getItems } from './lib/api';

export default function Monitors() {
  const [monitors, setMonitors] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const typeFilter = searchParams.get('category');
  const [error, setError] = React.useState(null);
  const { addItem, selectedItems } = useCart();

  React.useEffect(() => {
    async function loadMonitors() {
      setLoading(true);
      try {
        const data = await getItems();
        setMonitors(data);
        // console.log(monitors.imageUrl);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    loadMonitors();
  }, []);

  const displayedMonitors = typeFilter
    ? monitors.filter((monitor) => monitor.category === typeFilter)
    : monitors;

  const handleAddToCart = (e, monitor) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(monitor);
  };

  const monitorsElements = displayedMonitors.map((monitor) => {
    const cartItem = selectedItems.find((item) => item.id === monitor.id);
    const quantity = cartItem?.quantity || 0;

    return (
      <div key={monitor.id}>
        <Link
          to={`/rent-monitors-chiangmai/${monitor.id}`}
          state={{
            search: `?${searchParams.toString()}`,
            type: typeFilter,
          }}
        >
          <div className="monitor-container">
            <button
              onClick={(e) => handleAddToCart(e, monitor)}
              className="add-to-cart-btn"
              aria-label={`Add ${monitor.name} to cart`}
            >
              <IoMdAdd size={20} />
            </button>
            {quantity > 0 && (
              <span className="cart-quantity-badge">{quantity}</span>
            )}
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
    );
  });
  function handleFilterChange(key, value) {
    setSearchParams((prevParams) => {
      if (value === null) {
        prevParams.delete(key);
      } else {
        prevParams.set(key, value);
      }
      return prevParams;
    });
  }

  if (loading) {
    return <h1>Loading...</h1>;
  }
  if (error) {
    return <h1>There was an error: {error.message}</h1>;
  }
  return (
    <>
      <Slide />
      <h2 className="h2-top">Upgrade Your Workspace in Chiang Mai </h2>
      <div className="filter-buttons">
        <button
          onClick={() => handleFilterChange('category', 'monitor')}
          className={`category
                        ${typeFilter === 'monitors' ? 'selected' : ''}`}
        >
          Monitors
        </button>
        <button
          onClick={() => handleFilterChange('category', 'desk')}
          className={`category 
                        ${typeFilter === 'desk' ? 'selected' : ''}`}
        >
          Desk
        </button>
        <button
          onClick={() => handleFilterChange('category', 'chair')}
          className={`category
                        ${typeFilter === 'rugged' ? 'selected' : ''}`}
        >
          Chair
        </button>
        <button
          onClick={() => handleFilterChange('category', 'playstation')}
          className={`category
                        ${typeFilter === 'playstation' ? 'selected' : ''}`}
        >
          Play Station
        </button>
        <button
          onClick={() => handleFilterChange('category', 'accessories')}
          className={`category
                        ${typeFilter === 'accessories' ? 'selected' : ''}`}
        >
          Accessories
        </button>
        {typeFilter ? (
          <button
            onClick={() => handleFilterChange('category', null)}
            className="clear-filters"
          >
            Clear filter
          </button>
        ) : null}
      </div>
      <div className="all-monitors">{monitorsElements}</div>
    </>
  );
}
