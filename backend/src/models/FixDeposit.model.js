const mongoose = require("mongoose");

const FixDepositSchema = new mongoose.Schema(
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
    interest_rate: {
      type: Number,
      required: true,
      default: 7.0, // annual rate in %
    },
    months: {
      type: Number,
      required: true,
      default: 12,
    },
    maturity_amount: {
      type: Number,
      required: true,
    },
    maturity_date: {
      type: Date,
      required: true,
    },
    isClaimed: {
      type: Boolean,
      default: false,
    },
    claimedAt: {
      type: Date,
    },
    fd_number: {
      type: Number,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const FixDepositModel = mongoose.model("fixdeposit", FixDepositSchema);

module.exports = { FixDepositModel };
