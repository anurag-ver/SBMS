const Razorpay = require("razorpay");

const key_id = process.env.Test_API_Key || process.env.RAZORPAY_KEY_ID || "";
const key_secret = process.env.Test_Key_Secret || process.env.RAZORPAY_KEY_SECRET || "";

const razorpayInstance = new Razorpay({
  key_id,
  key_secret,
});

module.exports = { razorpayInstance };
