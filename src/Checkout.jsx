import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import useCart from './hooks/cart';
import StripePaymentForm from './Component/StripePaymentForm';

// Initialize Stripe with publishable key from environment variable
// In Vite, environment variables must be prefixed with VITE_
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
  const { selectedItems } = useCart();
  const navigate = useNavigate();
  
  const formatPrice = (price) => {
    return price.toLocaleString('en-US');
  };
  
  // Form state
  const [formData, setFormData] = useState({
    rentalPeriod: null, // Will be [startDate, endDate]
    name: '',
    email: '',
    whatsapp: '',
    address: ''
  });
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate rental days from selected date range
  const calculateRentalDays = () => {
    if (!formData.rentalPeriod) return 0;
    const [start, end] = formData.rentalPeriod;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays; // Minimum 1 day
  };

  // Calculate price per day (weekly price / 7)
  const calculateDailyPrice = (weeklyPrice) => {
    return Math.round(weeklyPrice / 7);
  };

  const rentalDays = calculateRentalDays();
  
  // Calculate totals
  const weeklySubtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const dailyRate = selectedItems.reduce((sum, item) => sum + (calculateDailyPrice(item.price) * item.quantity), 0);
  const totalPrice = dailyRate * rentalDays;

  // Redirect if cart is empty
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
          <p>Add some monitors to checkout!</p>
          <Link to="/rent-monitors-chiangmai" className="rent-btn">
            Browse Monitors
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (value) => {
    setFormData(prev => ({
      ...prev,
      rentalPeriod: value
    }));
  };

  const formatDateRange = (dateRange) => {
    if (!dateRange) return '';
    const [start, end] = dateRange;
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const validateDeliveryInfo = () => {
    if (!formData.rentalPeriod || !formData.name || !formData.email || !formData.whatsapp || !formData.address) {
      alert('Please fill in all required delivery information');
      return false;
    }
    return true;
  };

  const handlePaymentSuccess = () => {
    setShowSuccessModal(true);
  };

  const handlePaymentError = (errorMessage) => {
    alert(`Payment failed: ${errorMessage}`);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    // Redirect to home or monitors page
    navigate('/rent-monitors-chiangmai');
  };

  return (
    <div className="checkout-page">
      <Link to="/rent-monitors-chiangmai/cart" relative="path">
        <p className="back-btn">
          <HiArrowNarrowLeft /> Back to cart
        </p>
      </Link>
      
      <h2>Checkout</h2>

      {/* Delivery Information Card */}
      <div className="checkout-form-section">
        <div className="checkout-card">
          <h3>Delivery Information</h3>
          
          <div className="form-group">
            <label htmlFor="rentalPeriod">
              Rental Period <span className="required">*</span>
            </label>
            {formData.rentalPeriod && (
              <div className="selected-date-range">
                {formatDateRange(formData.rentalPeriod)}
              </div>
            )}
            <div className="calendar-wrapper">
              <Calendar
                onChange={handleDateChange}
                value={formData.rentalPeriod}
                selectRange={true}
                minDate={new Date()}
                className="rental-calendar"
              />
            </div>
            <small className="form-hint">Select start and end dates for your rental period</small>
          </div>

          <div className="form-group">
            <label htmlFor="name">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="your.email@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="whatsapp">
              WhatsApp Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="+66 XX XXX XXXX"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">
              {`Delivery Address (or Google Maps Link)`} <span className="required">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="form-input form-textarea"
              placeholder="Enter your full delivery address"
              rows="3"
            />
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="checkout-card">
          <h3>Order Summary ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h3>
          {rentalDays > 0 && (
            <div className="rental-period-info">
              📅 Rental Period: {rentalDays} {rentalDays === 1 ? 'day' : 'days'}
            </div>
          )}
          
          <div className="checkout-items-list">
            {selectedItems.map((item) => (
              <div key={item.id} className="checkout-item">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="checkout-item-img"
                />
                <div className="checkout-item-details">
                  <h4>{item.name}</h4>
                  <p className="checkout-item-price">
                    {formatPrice(item.price)} THB/week ({formatPrice(calculateDailyPrice(item.price))} THB/day) × {item.quantity}
                  </p>
                </div>
                <div className="checkout-item-total">
                  {formatPrice(calculateDailyPrice(item.price) * item.quantity * rentalDays)} THB
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-summary-totals">
            <div className="summary-row">
              <span>Weekly Rate:</span>
              <span>{formatPrice(weeklySubtotal)} THB/week</span>
            </div>
            <div className="summary-row">
              <span>Daily Rate:</span>
              <span>{formatPrice(dailyRate)} THB/day</span>
            </div>
            <div className="summary-row">
              <span>Rental Days:</span>
              <span>{rentalDays} {rentalDays === 1 ? 'day' : 'days'}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span><strong>{formatPrice(totalPrice)} THB</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* Payment Card with Stripe */}
      <div className="checkout-card">
        <h3>Payment Information</h3>
        
        <div className="payment-info-message">
          <p>💳 Secure payment powered by Stripe</p>
          <p>Test mode: Use card number 4242 4242 4242 4242 with any future date and CVC</p>
        </div>

        <Elements stripe={stripePromise}>
          <StripePaymentForm
            amount={totalPrice}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            validateDeliveryInfo={validateDeliveryInfo}
          />
        </Elements>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">✓</div>
            <h2>Thank you for your order!</h2>
            <p>We will message you on WhatsApp at <strong>{formData.whatsapp}</strong></p>
            <p className="modal-subtext">You will receive a confirmation email at {formData.email}</p>
            <button onClick={handleCloseModal} className="rent-btn modal-btn">
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
