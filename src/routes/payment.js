const express = require("express");
const { userAuth } = require("../middlewares/auth");
const razorpayInstance = require("../utils/razorpay");
const paymentRouter = express.Router();
const Payment = require("../models/payment");
const MEMBERSHIP_COST = require("../utils/constants");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const User = require("../models/user");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;
    const order = await razorpayInstance.orders.create({
      amount: MEMBERSHIP_COST[membershipType] * 100,
      currency: "INR",
      receipt: Date.now().toString(),
      partial_payment: false,
      notes: {
        firstName: firstName,
        lastName: lastName,
        emailId: emailId,
        membershipType: membershipType,
      },
    });
    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      amount: order.amount,
      status: order.status,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();
    res.json({ ...savedPayment.toJSON(), key: process.env.RAZORPAY_KEY });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    console.log("Webhook called");
    const webhookSignature = req.get("X-Razorpay-Signature");
    console.log("Webhook Signature", webhookSignature);
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET,
    );

    if (!isWebhookValid) {
      console.log("INvalid Webhook Signature");

      return res.status(400).json({ msg: "Webhook signature is invalid" });
    }

    console.log("Valid Webhook Signature");

    // Udpate my payment Status in DB of Payment Schema

    const paymentDetails = req.body.payload.payment.entity;

    const payment = await Payment.findOne({
      orderId: paymentDetails.order_id,
    });

    payment.status = paymentDetails.status;
    await payment.save();

    // Udpate my payment Status in DB of User Schema

    const user = await User.findOne({
      _id: payment.userId,
    });

    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();
    console.log("User saved");

    // Update the user as premium

    // if (req.body.event == "payment.captured") {
    // }
    // if (req.body.event == "payment.failed") {
    // }

    // return success response to razorpay

    return res.status(200).json({ msg: "Webhook received successfully" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

paymentRouter.get("/premium/verify", userAuth, async(req,res)=> {
  const user = req.user.toJSON();
  console.log(user);

  if(user.isPremium) {
        return res.json({ ...user });
  }
    return res.json({ ...user });
})
module.exports = paymentRouter;
