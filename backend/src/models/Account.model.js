const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    ac_type: {
      type: String,
      default: "saving",
      enum: ["saving", "current"],
    },
    account_no: {
      type: Number,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const AccountModel = mongoose.models.account || mongoose.model("account", AccountSchema);
if (!mongoose.models.Account) {
  mongoose.model("Account", AccountSchema);
}

module.exports = { AccountModel };
