import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { LuShoppingCart } from 'react-icons/lu';
import { RiMessengerLine } from 'react-icons/ri';

import useCart from './lib/cart';
import { getItem } from './lib/api';

export default function ItemDetailPage() {
  const [item, setItem] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const { id } = useParams();
  const { addItem, selectedItems } = useCart();
  const location = useLocation();

  const handleAddToCart = () => {
    if (item) {
      addItem(item);
    }
  };

  const isInCart =
    item && selectedItems.some((item) => item.id === item.id);
  const cartItem = selectedItems.find((item) => item?.id === item?.id);
  const quantity = cartItem?.quantity || 0;

  React.useEffect(() => {
    async function loadItem() {
      setLoading(true);
      try {
        const data = await getItem(id);
        setItem(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [id]);

  if (loading) {
    return <h1>Loading...</h1>;
  }
  if (error) {
    return <h1>There was an error: {error.message}</h1>;
  }
  const search = location.state?.search || '';
  const category = location.state?.category || 'all';

  return (
    <div>
      {item && (
        <div>
          <Link to={`..${search}`} relative="path">
            <p className="back-btn">
              <HiArrowNarrowLeft /> Back to {category}
            </p>
          </Link>
          <div className="detail-responsive-container">
            <div className="item-detail-img-container">
              <img src={item.imageUrl} alt={item.name} />
            </div>
            <div className="detail-container">
              <div className="detail-top-container">
                <h2>{item.name}</h2>
                <p>{item.description}</p>
                <p className="price">
                  <span>{item.price} THB</span>/week
                </p>

                <div className="detail-actions">
                  <button
                    onClick={handleAddToCart}
                    className="rent-btn add-to-cart-detail-btn"
                  >
                    <LuShoppingCart size={20} />
                    {isInCart ? `In Cart (${quantity})` : 'Add to Cart'}
                  </button>
                  <a
                    href="http://m.me/280517075156100"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="messenger-icon-btn"
                    aria-label="Contact us on Messenger"
                  >
                    <RiMessengerLine size={24} />
                  </a>
                </div>
              </div>

              <div className="specifications">
                <h3>Specifications</h3>
                <p>{item.info}</p>
                <ul className="specifications-list">
                  {Object.entries(item.spec).map(([key, value]) => (
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
