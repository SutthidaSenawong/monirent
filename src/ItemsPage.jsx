import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { IoMdAdd } from 'react-icons/io';
import useCart from './lib/cart';

import Slide from './Slide';
import { getItems } from './lib/api';

export default function ItemsPage() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const typeFilter = searchParams.get('category');
  const [error, setError] = React.useState(null);
  const { addItem, selectedItems } = useCart();

  React.useEffect(() => {
    async function loadItems() {
      setLoading(true);
      try {
        const data = await getItems();
        setItems(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, []);

  const displayItems = typeFilter
    ? items.filter((item) => item.category === typeFilter)
    : items;

  const handleAddToCart = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(item);
  };

  const itemList = displayItems.map((item) => {
    const cartItem = selectedItems.find((cartItem) => cartItem.id === item.id);
    const quantity = cartItem?.quantity || 0;

    return (
      <div key={item.id}>
        <Link
          to={`/rent-monitors-chiangmai/${item.id}`}
          state={{
            search: `?${searchParams.toString()}`,
            type: typeFilter,
          }}
        >
          <div className="item-container">
            <button
              onClick={(e) => handleAddToCart(e, item)}
              className="add-to-cart-btn"
              aria-label={`Add ${item.name} to cart`}
            >
              <IoMdAdd size={20} />
            </button>
            {quantity > 0 && (
              <span className="cart-quantity-badge">{quantity}</span>
            )}
            <img
              src={`${item.imageUrl}`}
              alt={item.name}
              className="item-img"
            />

            <div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <p>
                <span>{item.price} THB</span>/week
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
      <div className="all-items">{itemList}</div>
    </>
  );
}
