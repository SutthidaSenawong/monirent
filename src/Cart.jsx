import { Link } from 'react-router-dom';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { IoMdAdd, IoMdRemove } from 'react-icons/io';
import useCart from './hooks/cart';

export default function Cart() {
  const { selectedItems, removeItem, updateQuantity } = useCart();

  const formatPrice = (price) => {
    return price.toLocaleString('en-US');
  };

  const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalPricePerDay = selectedItems.reduce((sum, item) => sum + (Math.round(item.price / 7) * item.quantity), 0);
  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const cartItemsElements = selectedItems.map((item) => (
    <div key={item.id} className="cart-item">
      <div className="cart-item-content">
        {/* Part 1: Image */}
        <img
          src={item.imageUrl}
          alt={item.name}
          className="cart-item-img"
        />
        
        {/* Part 2: Name and Description */}
        <div className="cart-item-info">
          <h3>{item.name}</h3>
          <p>{item.description}</p>
        </div>
        
        {/* Part 3: Price per week */}
        <div className="cart-item-price">
          <span className="price-label">Price/week</span>
          <span className="price-value">{formatPrice(item.price)} THB</span>
        </div>
        
        {/* Part 4: Quantity controls and remove button */}
        <div className="cart-item-actions">
          <div className="quantity-controls">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="quantity-btn"
              aria-label="Decrease quantity"
            >
              <IoMdRemove size={16} />
            </button>
            <span className="quantity-display">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="quantity-btn"
              aria-label="Increase quantity"
            >
              <IoMdAdd size={16} />
            </button>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="remove-btn-cart"
            aria-label={`Remove ${item.name} from cart`}
          >
            <RiDeleteBin6Line size={20} />
          </button>
        </div>
      </div>
    </div>
  ));

  if (selectedItems.length === 0) {
    return (
      <div>
        <Link to="/rent-monitors-chiangmai" relative="path">
          <p className="back-btn">
            <HiArrowNarrowLeft /> Back to all monitors
          </p>
        </Link>
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some monitors to get started!</p>
          <Link to="/rent-monitors-chiangmai" className="rent-btn">
            Browse Monitors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Link to="/rent-monitors-chiangmai" relative="path">
        <p className="back-btn">
          <HiArrowNarrowLeft /> Back to all monitors
        </p>
      </Link>
      <h2>Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h2>
      <div className="cart-items-list">{cartItemsElements}</div>
      
      <div className="cart-summary-sticky">
        <div className="cart-summary">
          <div className="summary-row">
            <span>Price per week:</span>
            <span>{formatPrice(totalPrice)} THB</span>
          </div>
          <div className="summary-row">
            <span>Price per day:</span>
            <span>{formatPrice(totalPricePerDay)} THB</span>
          </div>
          <Link
            to="/rent-monitors-chiangmai/checkout"
            className="rent-btn checkout-btn"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
