/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import Stripe from "stripe";

// Initialize Stripe
// Make sure to set STRIPE_SECRET_KEY in your environment variables
// You can create a .env file in the functions directory with:
// STRIPE_SECRET_KEY=sk_test_...
let stripe: Stripe;

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

export const createPaymentIntent = onRequest({cors: true}, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    if (!stripe) {
      const secret = process.env.STRIPE_SECRET_KEY;
      if (!secret) {
        throw new Error("Missing STRIPE_SECRET_KEY environment variable");
      }
      stripe = new Stripe(secret);
    }

    const {amount, currency, metadata} = req.body;

    if (!amount) {
      res.status(400).send({error: "Amount is required"});
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount),
      currency: currency || "thb",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadata || {},
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: unknown) {
    logger.error("Error creating payment intent", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).send({error: errorMsg});
  }
});
