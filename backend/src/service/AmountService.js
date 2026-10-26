const crypto = require("crypto");
const { AccountModel } = require("../models/Account.model");
const { TransactionModel } = require("../models/Transaction.model");
const { razorpayInstance } = require("../config/razorpay.config");
const ApiError = require("../utils/ApiError");

const generateAccountNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000);
};

class AmountService {
  /**
   * Deposit money: Supports both Razorpay gateway and Instant Test Deposit
   */
  static async addMoney(body, userId) {
    const { account_no, amount, remark, payment_mode } = body;
    const numAmount = Number(amount);

    if (!account_no) {
      throw new ApiError(400, "Account number is required");
    }
    if (!numAmount || numAmount <= 0) {
      throw new ApiError(400, "Enter a valid amount greater than 0");
    }

    const account = await AccountModel.findOne({ account_no, user: userId });
    if (!account) {
      throw new ApiError(404, "Bank Account Not Found");
    }

    // 1. Instant Direct Deposit Mode (Zero OTP, zero phone number prompts)
    if (payment_mode === "instant") {
      account.amount += numAmount;
      await account.save();

      const txn = await TransactionModel.create({
        user: userId,
        account: account._id,
        amount: numAmount,
        type: "credit",
        isSuccess: true,
        remark: remark || "Instant Test Deposit",
      });

      return {
        msg: `₹${numAmount.toLocaleString("en-IN")} Deposited Instantly!`,
        isSuccess: true,
        account,
        updatedAmount: account.amount,
      };
    }

    // 2. Razorpay Gateway Mode
    const txn = await TransactionModel.create({
      user: userId,
      account: account._id,
      amount: numAmount,
      type: "credit",
      isSuccess: false,
      remark: remark || "Deposit via Razorpay Gateway",
    });

    try {
      const options = {
        amount: Math.round(numAmount * 100),
        currency: "INR",
        receipt: `txn_${txn._id.toString().slice(-10)}`,
        notes: {
          account_no: String(account_no),
          userId: String(userId),
          txn_id: txn._id.toString(),
        },
      };

      const order = await razorpayInstance.orders.create(options);

      txn.order_id = order.id;
      await txn.save();

      return {
        msg: "Razorpay Order Created",
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        txn_id: txn._id,
        key_id: process.env.Test_API_Key || process.env.RAZORPAY_KEY_ID,
        account_no: account.account_no,
      };
    } catch (err) {
      txn.remark = `Razorpay order creation failed: ${err.message}`;
      await txn.save();
      throw new ApiError(500, `Razorpay Error: ${err.error?.description || err.message}`);
    }
  }

  /**
   * Verify Razorpay Payment Signature and Credit Account
   */
  static async verifyPayment(body, txn_id) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    const transactionId = txn_id || body.txn_id;

    if (!transactionId) {
      throw new ApiError(400, "Transaction reference (txn_id) is required");
    }

    const txn = await TransactionModel.findById(transactionId);
    if (!txn) {
      throw new ApiError(404, "Transaction record not found");
    }

    if (txn.isSuccess) {
      return {
        msg: "Payment was already verified",
        isSuccess: true,
        txn,
        url: `${process.env.FRONTEND_URI || "http://localhost:5173"}/transactions?payment=already_success`,
      };
    }

    const secret = process.env.Test_Key_Secret || process.env.RAZORPAY_KEY_SECRET;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      txn.isSuccess = false;
      txn.remark = "Payment verification failed (Invalid signature)";
      await txn.save();
      throw new ApiError(400, "Payment verification failed: Invalid signature");
    }

    // Signature verified! Mark transaction success and credit money
    txn.isSuccess = true;
    txn.order_id = razorpay_order_id;
    txn.payment_id = razorpay_payment_id;
    txn.signature = razorpay_signature;
    txn.remark = "Added Funds (Razorpay Verified)";
    await txn.save();

    const account = await AccountModel.findById(txn.account);
    if (account) {
      account.amount += txn.amount;
      await account.save();
    }

    return {
      msg: `Payment Verified! ₹${txn.amount.toLocaleString("en-IN")} credited successfully!`,
      isSuccess: true,
      txn,
      updatedAmount: account ? account.amount : 0,
      url: `${process.env.FRONTEND_URI || "http://localhost:5173"}/transactions?payment=success`,
    };
  }

  /**
   * Create New Bank Account
   */
  static async addNewAccount(userId, body) {
    const { ac_type } = body;
    const accountType = ac_type === "current" ? "current" : "saving";

    let uniqueAccountNo = generateAccountNumber();
    let exists = await AccountModel.findOne({ account_no: uniqueAccountNo });
    while (exists) {
      uniqueAccountNo = generateAccountNumber();
      exists = await AccountModel.findOne({ account_no: uniqueAccountNo });
    }

    const newAccount = await AccountModel.create({
      user: userId,
      amount: 0,
      ac_type: accountType,
      account_no: uniqueAccountNo,
    });

    await TransactionModel.create({
      user: userId,
      account: newAccount._id,
      amount: 0,
      type: "credit",
      isSuccess: true,
      remark: "Account Opening",
    });

    return {
      msg: `${accountType.toUpperCase()} Account Created Successfully!`,
      account: newAccount,
    };
  }

  /**
   * Get All Accounts for User
   */
  static async getAllAccounts(userId) {
    const accounts = await AccountModel.find({ user: userId }).sort({ createdAt: -1 });
    return {
      accounts,
      totalAmount: accounts.reduce((sum, item) => sum + (item.amount || 0), 0),
    };
  }

  /**
   * Get All Transactions for User
   */
  static async getAllTransactions(userId) {
    const transactions = await TransactionModel.find({ user: userId })
      .populate("account", "account_no ac_type")
      .sort({ createdAt: -1 });
    return { transactions };
  }

  /**
   * Transfer Funds Peer-to-Peer
   */
  static async transferMoney(body, userId) {
    const { from_account_no, to_account_no, amount, remark } = body;
    const numAmount = Number(amount);

    if (!from_account_no || !to_account_no) {
      throw new ApiError(400, "Sender and Receiver account numbers are required");
    }
    if (from_account_no == to_account_no) {
      throw new ApiError(400, "Cannot transfer funds to the same account");
    }
    if (!numAmount || numAmount <= 0) {
      throw new ApiError(400, "Enter a valid transfer amount greater than 0");
    }

    const senderAccount = await AccountModel.findOne({ account_no: from_account_no, user: userId });
    if (!senderAccount) {
      throw new ApiError(404, "Source Account Not Found");
    }

    if (senderAccount.amount < numAmount) {
      throw new ApiError(400, "Insufficient Balance in source account");
    }

    const receiverAccount = await AccountModel.findOne({ account_no: to_account_no });
    if (!receiverAccount) {
      throw new ApiError(404, "Destination Account Not Found");
    }

    senderAccount.amount -= numAmount;
    receiverAccount.amount += numAmount;

    await senderAccount.save();
    await receiverAccount.save();

    await TransactionModel.create({
      user: userId,
      account: senderAccount._id,
      amount: numAmount,
      type: "debit",
      isSuccess: true,
      remark: remark || `Transfer to A/C ${to_account_no}`,
    });

    await TransactionModel.create({
      user: receiverAccount.user,
      account: receiverAccount._id,
      amount: numAmount,
      type: "credit",
      isSuccess: true,
      remark: remark || `Transfer received from A/C ${from_account_no}`,
    });

    return {
      msg: `₹${numAmount.toLocaleString("en-IN")} Transferred Successfully!`,
      remainingBalance: senderAccount.amount,
      senderAccount,
    };
  }
}

module.exports = AmountService;
