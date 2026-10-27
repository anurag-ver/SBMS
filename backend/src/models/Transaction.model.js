const mongoose = require("mongoose");
require("./Account.model");
require("./User.model");

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    isSuccess: {
      type: Boolean,
      default: false,
    },
    remark: {
      type: String,
      default: "Transaction",
    },
    order_id: {
      type: String,
      default: "",
    },
    payment_id: {
      type: String,
      default: "",
    },
    signature: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const TransactionModel =
  mongoose.models.transaction ||
  mongoose.models.Transaction ||
  mongoose.model("transaction", TransactionSchema);

if (!mongoose.models.Transaction) {
  mongoose.model("Transaction", TransactionSchema);
}

module.exports = { TransactionModel };
