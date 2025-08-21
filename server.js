const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_PK || "sk_test_xxx", {
  apiVersion: "2024-06-20", // or latest
});

const app = express();
app.use(cors());
app.use(express.json());

// ---- A) For PaymentSheet (Capacitor native) ----
app.post("/paymentsheet", async (req, res) => {
  try {
    const {
      amount = 1999,
      currency = "usd",
      customerEmail = "test@example.com",
    } = req.body;

    // 1) Create/Retrieve Customer (demo: always new)
    const customer = await stripe.customers.create({ email: customerEmail });

    // 2) Ephemeral key for the customer (required by PaymentSheet on mobile)
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-06-20" },
    );

    // 3) PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // cents
      currency,
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      paymentIntentClientSecret: paymentIntent.client_secret,
      ephemeralKeySecret: ephemeralKey.secret,
      customerId: customer.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- B) For Web Payment Element ----
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount = 1999, currency = "usd" } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 4242;
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`),
);
