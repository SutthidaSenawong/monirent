/* eslint-disable react/prop-types */
import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function StripePaymentForm({
  amount,
  onSuccess,
  onError,
  isProcessing,
  setIsProcessing,
  validateDeliveryInfo,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate delivery information first
    if (validateDeliveryInfo && !validateDeliveryInfo()) {
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // Create payment method
      const { error } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        setCardError(error.message);
        setIsProcessing(false);
        onError(error.message);
        return;
      }

      // Simulate successful payment for demo
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess();
      }, 1500);
    } catch (error) {
      setCardError(error.message);
      setIsProcessing(false);
      onError(error.message);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#213547",
        "::placeholder": {
          color: "#5d5d5f",
        },
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
      },
      invalid: {
        color: "#ff3b30",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='form-group'>
        <label>
          Card Details <span className='required'>*</span>
        </label>
        <div className='stripe-card-element'>
          <CardElement options={cardElementOptions} />
        </div>
        {cardError && <div className='card-error'>{cardError}</div>}
        <small className='form-hint'>
          Test card: 4242 4242 4242 4242, any future date, any CVC
        </small>
      </div>

      <button
        type='submit'
        className='rent-btn checkout-submit-btn'
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? "Processing..." : `Complete Order - ${amount} THB/week`}
      </button>
    </form>
  );
}
