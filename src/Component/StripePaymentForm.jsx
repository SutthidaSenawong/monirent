/* eslint-disable react/prop-types */
import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function StripePaymentForm({
  amount,
  customerName,
  customerEmail,
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
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        setCardError(error.message);
        setIsProcessing(false);
        onError(error.message);
        return;
      }

      // Call your backend to create a PaymentIntent
      // Note: You need to implement this endpoint on your backend
      const response = await fetch("https://createpaymentintent-52vm5wxbra-uc.a.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: amount * 100, // Convert to satang (smallest currency unit for THB)
          currency: "thb",
          metadata: {
            customerName: customerName,
            customerEmail: customerEmail,
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create payment intent");
      }

      // Confirm the payment with the client secret from the backend
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent.status === "succeeded") {
        setIsProcessing(false);
        onSuccess(data.clientSecret);
      } else {
        throw new Error(`Payment failed with status: ${paymentIntent.status}`);
      }
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
