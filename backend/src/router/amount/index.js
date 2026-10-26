const express = require("express");
const router = express.Router();
const AmountController = require("../../controller/AmountController");
const AuthMiddleware = require("../../middleware/AuthMiddleware");

// Razorpay redirect callback (called by gateway without Bearer token)
router.post("/verify-payment-callback/:txn_id", AmountController.verifyPaymentCallback);

// Protected routes
router.use(AuthMiddleware);

router.get("/accounts", AmountController.getAllAccounts);
router.get("/transactions", AmountController.getAllTransactions);
router.post("/add-money", AmountController.addMoney);
router.post("/verify-payment", AmountController.verifyPayment);
router.post("/add-account", AmountController.addNewAccount);
router.post("/transfer", AmountController.transferMoney);

module.exports = router;
