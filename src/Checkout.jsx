import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiArrowNarrowLeft, HiClipboardCopy, HiCheck } from "react-icons/hi";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import useCart from "./hooks/cart";
import StripePaymentForm from "./Component/StripePaymentForm";
import { savePurchaseInfo } from "../api";

// Initialize Stripe with publishable key from environment variable
// In Vite, environment variables must be prefixed with VITE_
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
  const { selectedItems } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return price.toLocaleString("en-US");
  };

  // Form state
  const [formData, setFormData] = useState({
    rentalPeriod: null, // Will be [startDate, endDate]
    name: "",
    email: "",
    whatsapp: "",
    address: "",
    hotelName: "",
    roomNumber: "",
    locationConfirmed: false,
  });

  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [copied, setCopied] = useState(false);

  const totalItems = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

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
  const weeklySubtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const dailyRate = selectedItems.reduce(
    (sum, item) => sum + calculateDailyPrice(item.price) * item.quantity,
    0
  );
  const deliveryFee = 200;
  const totalPrice = dailyRate * rentalDays + deliveryFee;

  // Redirect if cart is empty
  if (selectedItems.length === 0) {
    return (
      <div>
        <Link to='/rent-monitors-chiangmai' relative='path'>
          <p className='back-btn'>
            <HiArrowNarrowLeft /> Back to all monitors
          </p>
        </Link>
        <div className='empty-cart'>
          <h2>Your cart is empty</h2>
          <p>Add some monitors to checkout!</p>
          <Link to='/rent-monitors-chiangmai' className='rent-btn'>
            Browse Monitors
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      rentalPeriod: value,
    }));
    if (errors.rentalPeriod) {
      setErrors((prev) => ({ ...prev, rentalPeriod: null }));
    }
  };

  const formatDateRange = (dateRange) => {
    if (!dateRange) return "";
    const [start, end] = dateRange;
    const formatDate = (date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const validateDeliveryInfo = () => {
    const newErrors = {};
    let firstErrorId = null;

    if (!formData.rentalPeriod) {
      newErrors.rentalPeriod = "Rental period is required";
      if (!firstErrorId) firstErrorId = "rental-calendar-container";
    }
    if (!formData.name) {
      newErrors.name = "Full Name is required";
      if (!firstErrorId) firstErrorId = "name";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
      if (!firstErrorId) firstErrorId = "email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      if (!firstErrorId) firstErrorId = "email";
    }

    if (!formData.whatsapp) {
      newErrors.whatsapp = "WhatsApp Number is required";
      if (!firstErrorId) firstErrorId = "whatsapp";
    } else if (!/^[\d\s+()-]+$/.test(formData.whatsapp)) {
      newErrors.whatsapp = "Please enter a valid phone number";
      if (!firstErrorId) firstErrorId = "whatsapp";
    }
    if (!formData.address) {
      newErrors.address = "Delivery Address is required";
      if (!firstErrorId) firstErrorId = "address";
    }
    if (!formData.hotelName) {
      newErrors.hotelName = "Hotel Name is required";
      if (!firstErrorId) firstErrorId = "hotelName";
    }
    if (!formData.locationConfirmed) {
      newErrors.locationConfirmed = "Please confirm your delivery location";
      if (!firstErrorId) firstErrorId = "location-confirm-container";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (firstErrorId) {
        const element = document.getElementById(firstErrorId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
            element.focus();
          }
        }
      }
      return false;
    }

    return true;
  };

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    try {
      const newOrderId = crypto.randomUUID();
      const purchaseOrder = {
        id: newOrderId,
        rentalPeriodFrom: formData.rentalPeriod[0].toISOString(),
        rentalPeriodTo: formData.rentalPeriod[1].toISOString(),
        fullName: formData.name,
        email: formData.email,
        whatsappNumber: formData.whatsapp,
        deliveryAddress: formData.address,
        hotelOrAccommodationName: formData.hotelName,
        roomNumber: formData.roomNumber,
        rentItems: selectedItems.map((item) => ({
          id: Number(item.id),
          name: item.name,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
        })),
        dailyRentRate: dailyRate,
        weeklyRentRate: weeklySubtotal,
        totalFee: totalPrice,
        status: "WAITING_FOR_DELIVERY",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        logs: [
          {
            timestamp: new Date().toISOString(),
            message: "customer purchase the order",
          },
        ],
      };

      await savePurchaseInfo(purchaseOrder);
      setOrderId(newOrderId);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error saving purchase info:", error);
      alert(
        "Payment successful but failed to save order details. Please contact support."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (errorMessage) => {
    alert(`Payment failed: ${errorMessage}`);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    // Redirect to home or monitors page
    navigate("/rent-monitors-chiangmai");
  };

  return (
    <div className='checkout-page'>
      <Link to='/rent-monitors-chiangmai/cart' relative='path'>
        <p className='back-btn'>
          <HiArrowNarrowLeft /> Back to cart
        </p>
      </Link>

      <h2>Checkout</h2>

      {/* Delivery Information Card */}
      <div className='checkout-form-section'>
        <div className='checkout-card'>
          <h3>Delivery Information</h3>

          <div className='form-group'>
            <label htmlFor='rentalPeriod'>
              Rental Period <span className='required'>*</span>
            </label>
            {formData.rentalPeriod && (
              <div className='selected-date-range'>
                {formatDateRange(formData.rentalPeriod)}
              </div>
            )}
            <div className='calendar-wrapper' id='rental-calendar-container'>
              <Calendar
                onChange={handleDateChange}
                value={formData.rentalPeriod}
                selectRange={true}
                minDate={new Date()}
                className='rental-calendar'
              />
            </div>
            {errors.rentalPeriod && (
              <span style={{ color: "red", fontSize: "0.875rem" }}>
                {errors.rentalPeriod}
              </span>
            )}
            <small className='form-hint'>
              Select start and end dates for your rental period
            </small>
          </div>

          <div className='form-group'>
            <label htmlFor='name'>
              Full Name <span className='required'>*</span>
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              required
              className='form-input'
              style={errors.name ? { borderColor: "red" } : {}}
              placeholder='Enter your full name'
            />
            {errors.name && (
              <span style={{ color: "red", fontSize: "0.875rem" }}>
                {errors.name}
              </span>
            )}
          </div>

          <div className='form-group'>
            <label htmlFor='email'>
              Email <span className='required'>*</span>
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              required
              className='form-input'
              style={errors.email ? { borderColor: "red" } : {}}
              placeholder='your.email@example.com'
            />
            {errors.email && (
              <span style={{ color: "red", fontSize: "0.875rem" }}>
                {errors.email}
              </span>
            )}
          </div>

          <div className='form-group'>
            <label htmlFor='whatsapp'>
              WhatsApp Number <span className='required'>*</span>
            </label>
            <input
              type='tel'
              id='whatsapp'
              name='whatsapp'
              value={formData.whatsapp}
              onChange={handleInputChange}
              required
              className='form-input'
              style={errors.whatsapp ? { borderColor: "red" } : {}}
              placeholder='+66 XX XXX XXXX'
            />
            {errors.whatsapp && (
              <span style={{ color: "red", fontSize: "0.875rem" }}>
                {errors.whatsapp}
              </span>
            )}
          </div>

          <div className='form-group'>
            <label htmlFor='address'>
              {`Delivery Address (or Google Maps Link)`}{" "}
              <span className='required'>*</span>
            </label>
            <textarea
              id='address'
              name='address'
              value={formData.address}
              onChange={handleInputChange}
              required
              className='form-input form-textarea'
              style={errors.address ? { borderColor: "red" } : {}}
              placeholder='Enter your full delivery address'
              rows='3'
            />
            {errors.address && (
              <span style={{ color: "red", fontSize: "0.875rem" }}>
                {errors.address}
              </span>
            )}
          </div>

          <div className='form-group'>
            <label htmlFor='hotelName'>
              Hotel / Accommodation Name <span className='required'>*</span>
            </label>
            <input
              type='text'
              id='hotelName'
              name='hotelName'
              value={formData.hotelName}
              onChange={handleInputChange}
              required
              className='form-input'
              style={errors.hotelName ? { borderColor: "red" } : {}}
              placeholder='Enter hotel or accommodation name'
            />
            {errors.hotelName && (
              <span style={{ color: "red", fontSize: "0.875rem" }}>
                {errors.hotelName}
              </span>
            )}
          </div>

          <div className='form-group'>
            <label htmlFor='roomNumber'>Room Number (optional)</label>
            <input
              type='text'
              id='roomNumber'
              name='roomNumber'
              value={formData.roomNumber}
              onChange={handleInputChange}
              className='form-input'
              placeholder='Enter room number if available'
            />
          </div>

          <div
            className='form-group checkbox-group'
            id='location-confirm-container'
          >
            <label
              className='checkbox-label'
              style={{
                display: "flex",
                gap: "10px",
                cursor: "pointer",
              }}
            >
              <input
                type='checkbox'
                name='locationConfirmed'
                checked={formData.locationConfirmed}
                onChange={handleInputChange}
                style={{ marginTop: "4px" }}
              />
              <span>
                I confirm the delivery location is within Chiang Mai City.{" "}
                <span className='required'>*</span>
              </span>
            </label>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className='checkout-card'>
          <h3>
            Order Summary ({totalItems} {totalItems === 1 ? "item" : "items"})
          </h3>
          {rentalDays > 0 && (
            <div className='rental-period-info'>
              📅 Rental Period: {rentalDays} {rentalDays === 1 ? "day" : "days"}
            </div>
          )}

          <div className='checkout-items-list'>
            {selectedItems.map((item) => (
              <div key={item.id} className='checkout-item'>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className='checkout-item-img'
                />
                <div className='checkout-item-details'>
                  <h4>{item.name}</h4>
                  <p className='checkout-item-price'>
                    {formatPrice(item.price)} THB/week (
                    {formatPrice(calculateDailyPrice(item.price))} THB/day) ×{" "}
                    {item.quantity}
                  </p>
                </div>
                <div className='checkout-item-total'>
                  {formatPrice(
                    calculateDailyPrice(item.price) * item.quantity * rentalDays
                  )}{" "}
                  THB
                </div>
              </div>
            ))}
          </div>

          <div className='checkout-summary-totals'>
            <div className='summary-row'>
              <span>Weekly Rate:</span>
              <span>{formatPrice(weeklySubtotal)} THB/week</span>
            </div>
            <div className='summary-row'>
              <span>Daily Rate:</span>
              <span>{formatPrice(dailyRate)} THB/day</span>
            </div>
            <div className='summary-row'>
              <span>Rental Days:</span>
              <span>
                {rentalDays} {rentalDays === 1 ? "day" : "days"}
              </span>
            </div>
            <div className='summary-row'>
              <span>Delivery Fee:</span>
              <span>{formatPrice(deliveryFee)} THB</span>
            </div>
            <div className='summary-row total'>
              <span>Total:</span>
              <span>
                <strong>{formatPrice(totalPrice)} THB</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Card with Stripe */}
      <div className='checkout-card'>
        <h3>Payment Information</h3>

        <div className='payment-info-message'>
          <p>💳 Secure payment powered by Stripe</p>
          <p>
            Test mode: Use card number 4242 4242 4242 4242 with any future date
            and CVC
          </p>
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
        <div className='modal-overlay' onClick={handleCloseModal}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <div className='modal-icon'>✓</div>
            <h2>Thank you for your order!</h2>
            {orderId && (
              <div
                className='order-id-container'
                style={{
                  margin: "1rem 0",
                  padding: "0.75rem",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "0.5rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    fontWeight: "500",
                  }}
                >
                  Order ID
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "white",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.25rem",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <code
                    style={{
                      fontFamily: "monospace",
                      fontSize: "1rem",
                      color: "#374151",
                    }}
                  >
                    {orderId}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(orderId);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: copied ? "#10b981" : "#6b7280",
                      display: "flex",
                      alignItems: "center",
                      padding: "0.25rem",
                    }}
                    title='Copy Order ID'
                  >
                    {copied ? <HiCheck size={20} /> : <HiClipboardCopy size={20} />}
                  </button>
                </div>
              </div>
            )}
            <p>
              We will message you on WhatsApp at{" "}
              <strong>{formData.whatsapp}</strong>
            </p>
            <p className='modal-subtext'>
              You will receive a confirmation email at {formData.email}
            </p>
            <button onClick={handleCloseModal} className='rent-btn modal-btn'>
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
