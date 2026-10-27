const mongoose = require("mongoose");
// Ensure Account and User models are registered before AtmCard references them
require("./Account.model");
require("./User.model");

const AtmCardSchema = new mongoose.Schema(
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
    card_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    card_holder: {
      type: String,
      required: true,
      trim: true,
    },
    card_type: {
      type: String,
      enum: ["visa", "mastercard", "rupay"],
      default: "visa",
    },
    card_network: {
      type: String,
      default: "Platinum",
    },
    cvv: {
      type: String,
      required: true,
    },
    expiry_month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    expiry_year: {
      type: Number,
      required: true,
    },
    pin: {
      type: String,
      required: true,
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
    daily_atm_limit: {
      type: Number,
      default: 25000,
    },
    daily_online_limit: {
      type: Number,
      default: 50000,
    },
    contactless_enabled: {
      type: Boolean,
      default: true,
    },
    international_enabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const AtmCardModel =
  mongoose.models.atmcard ||
  mongoose.models.AtmCard ||
  mongoose.model("atmcard", AtmCardSchema);

if (!mongoose.models.AtmCard) {
  mongoose.model("AtmCard", AtmCardSchema);
}

module.exports = {
  AtmCardModel,
};
