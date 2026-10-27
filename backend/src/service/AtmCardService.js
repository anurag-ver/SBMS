const bcryptjs = require("bcryptjs");
const { AtmCardModel } = require("../models/AtmCard.model");
const { AccountModel } = require("../models/Account.model");
const { UserModel } = require("../models/User.model");
const { TransactionModel } = require("../models/Transaction.model");
const ApiError = require("../utils/ApiError");

const PREFIXES = {
  visa: "4532",
  mastercard: "5421",
  rupay: "6071",
};

const NETWORKS = {
  visa: "Platinum",
  mastercard: "World",
  rupay: "Select",
};

const generateCardNumber = (cardType = "visa") => {
  const prefix = PREFIXES[cardType.toLowerCase()] || "4532";
  let rest = "";
  for (let i = 0; i < 12; i++) {
    rest += Math.floor(Math.random() * 10).toString();
  }
  return `${prefix}${rest}`;
};

const generateCvv = () => {
  return Math.floor(100 + Math.random() * 900).toString();
};

class AtmCardService {
  /**
   * Get all ATM cards for user; auto-provision primary card if user has none.
   */
  static async getUserCards(userId) {
    let cards = await AtmCardModel.find({ user: userId })
      .populate("account", "account_no ac_type amount")
      .sort({ createdAt: -1 });

    if (cards.length === 0) {
      // Find user's primary account
      const user = await UserModel.findById(userId);
      const primaryAccount = await AccountModel.findOne({ user: userId });

      if (user && primaryAccount) {
        const hashedPin = await bcryptjs.hash("1234", 10);
        const now = new Date();
        const initialCard = await AtmCardModel.create({
          user: userId,
          account: primaryAccount._id,
          card_number: generateCardNumber("visa"),
          card_holder: user.name.toUpperCase(),
          card_type: "visa",
          card_network: "Platinum",
          cvv: generateCvv(),
          expiry_month: now.getMonth() + 1,
          expiry_year: now.getFullYear() + 5,
          pin: hashedPin,
          is_blocked: false,
          daily_atm_limit: 25000,
          daily_online_limit: 50000,
          contactless_enabled: true,
          international_enabled: false,
        });

        cards = await AtmCardModel.find({ user: userId })
          .populate("account", "account_no ac_type amount");
      }
    }

    return {
      cards: cards.map((c) => ({
        _id: c._id,
        card_number: c.card_number,
        card_holder: c.card_holder,
        card_type: c.card_type,
        card_network: c.card_network,
        cvv: c.cvv,
        expiry_month: c.expiry_month,
        expiry_year: c.expiry_year,
        is_blocked: c.is_blocked,
        daily_atm_limit: c.daily_atm_limit,
        daily_online_limit: c.daily_online_limit,
        contactless_enabled: c.contactless_enabled,
        international_enabled: c.international_enabled,
        account: c.account,
        createdAt: c.createdAt,
      })),
    };
  }

  /**
   * Apply / Issue a new ATM Debit Card
   */
  static async applyNewCard(userId, body) {
    const { account_no, card_type = "visa", pin = "1234" } = body;

    if (!account_no) {
      throw new ApiError(400, "Bank account number is required to link the ATM card");
    }

    if (!/^\d{4}$/.test(String(pin))) {
      throw new ApiError(400, "ATM PIN must be exactly 4 digits");
    }

    const account = await AccountModel.findOne({ account_no, user: userId });
    if (!account) {
      throw new ApiError(404, "Bank account not found or not owned by user");
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const normalizedType = ["visa", "mastercard", "rupay"].includes(card_type.toLowerCase())
      ? card_type.toLowerCase()
      : "visa";

    let cardNumber = generateCardNumber(normalizedType);
    let exists = await AtmCardModel.findOne({ card_number: cardNumber });
    while (exists) {
      cardNumber = generateCardNumber(normalizedType);
      exists = await AtmCardModel.findOne({ card_number: cardNumber });
    }

    const hashedPin = await bcryptjs.hash(String(pin), 10);
    const now = new Date();

    const newCard = await AtmCardModel.create({
      user: userId,
      account: account._id,
      card_number: cardNumber,
      card_holder: user.name.toUpperCase(),
      card_type: normalizedType,
      card_network: NETWORKS[normalizedType] || "Platinum",
      cvv: generateCvv(),
      expiry_month: now.getMonth() + 1,
      expiry_year: now.getFullYear() + 5,
      pin: hashedPin,
      is_blocked: false,
      daily_atm_limit: 25000,
      daily_online_limit: 50000,
      contactless_enabled: true,
      international_enabled: false,
    });

    const populatedCard = await AtmCardModel.findById(newCard._id).populate(
      "account",
      "account_no ac_type amount"
    );

    return {
      msg: `New ${normalizedType.toUpperCase()} Debit Card issued successfully!`,
      card: populatedCard,
    };
  }

  /**
   * Toggle Freeze / Block Card
   */
  static async toggleBlockCard(userId, body) {
    const { card_id } = body;
    if (!card_id) {
      throw new ApiError(400, "Card ID is required");
    }

    const card = await AtmCardModel.findOne({ _id: card_id, user: userId });
    if (!card) {
      throw new ApiError(404, "ATM Card not found");
    }

    card.is_blocked = !card.is_blocked;
    await card.save();

    return {
      msg: card.is_blocked
        ? `Card •••• ${card.card_number.slice(-4)} has been blocked/frozen.`
        : `Card •••• ${card.card_number.slice(-4)} has been unblocked and is active.`,
      is_blocked: card.is_blocked,
    };
  }

  /**
   * Change / Set 4-digit ATM PIN
   */
  static async changePin(userId, body) {
    const { card_id, old_pin, new_pin } = body;

    if (!card_id || !new_pin) {
      throw new ApiError(400, "Card ID and New PIN are required");
    }

    if (!/^\d{4}$/.test(String(new_pin))) {
      throw new ApiError(400, "New ATM PIN must be exactly 4 digits");
    }

    const card = await AtmCardModel.findOne({ _id: card_id, user: userId });
    if (!card) {
      throw new ApiError(404, "ATM Card not found");
    }

    // Verify old PIN if provided
    if (old_pin) {
      const isMatch = await bcryptjs.compare(String(old_pin), card.pin);
      if (!isMatch) {
        throw new ApiError(400, "Current ATM PIN is incorrect");
      }
    }

    card.pin = await bcryptjs.hash(String(new_pin), 10);
    await card.save();

    return {
      msg: `ATM PIN for Card •••• ${card.card_number.slice(-4)} updated successfully!`,
    };
  }

  /**
   * Update Daily Limits & Features
   */
  static async updateLimits(userId, body) {
    const {
      card_id,
      daily_atm_limit,
      daily_online_limit,
      contactless_enabled,
      international_enabled,
    } = body;

    if (!card_id) {
      throw new ApiError(400, "Card ID is required");
    }

    const card = await AtmCardModel.findOne({ _id: card_id, user: userId });
    if (!card) {
      throw new ApiError(404, "ATM Card not found");
    }

    if (daily_atm_limit !== undefined) {
      card.daily_atm_limit = Math.min(100000, Math.max(1000, Number(daily_atm_limit)));
    }
    if (daily_online_limit !== undefined) {
      card.daily_online_limit = Math.min(200000, Math.max(1000, Number(daily_online_limit)));
    }
    if (contactless_enabled !== undefined) {
      card.contactless_enabled = Boolean(contactless_enabled);
    }
    if (international_enabled !== undefined) {
      card.international_enabled = Boolean(international_enabled);
    }

    await card.save();

    return {
      msg: "Card usage limits & controls updated successfully!",
      card,
    };
  }

  /**
   * Simulate realistic ATM Cash Withdrawal
   */
  static async withdrawViaAtm(userId, body) {
    const { card_id, pin, amount } = body;
    const numAmount = Number(amount);

    if (!card_id) throw new ApiError(400, "Card ID is required");
    if (!pin) throw new ApiError(400, "ATM PIN is required");
    if (!numAmount || numAmount < 100) {
      throw new ApiError(400, "Minimum ATM cash withdrawal is ₹100");
    }
    if (numAmount % 100 !== 0) {
      throw new ApiError(400, "ATM withdrawals must be in multiples of ₹100 (e.g. ₹500, ₹1,000)");
    }

    const card = await AtmCardModel.findOne({ _id: card_id, user: userId });
    if (!card) {
      throw new ApiError(404, "ATM Card not found");
    }

    if (card.is_blocked) {
      throw new ApiError(403, "This ATM Card is currently blocked/frozen. Please unblock it first.");
    }

    const isMatch = await bcryptjs.compare(String(pin), card.pin);
    if (!isMatch) {
      throw new ApiError(401, "Incorrect 4-digit ATM PIN. Access denied.");
    }

    if (numAmount > card.daily_atm_limit) {
      throw new ApiError(
        400,
        `Withdrawal exceeds card daily limit of ₹${card.daily_atm_limit.toLocaleString("en-IN")}`
      );
    }

    const account = await AccountModel.findById(card.account);
    if (!account) {
      throw new ApiError(404, "Linked bank account not found");
    }

    if (account.amount < numAmount) {
      throw new ApiError(
        400,
        `Insufficient account balance. Available: ₹${account.amount.toLocaleString("en-IN")}`
      );
    }

    // Deduct cash from linked account
    account.amount -= numAmount;
    await account.save();

    const last4 = card.card_number.slice(-4);
    const txn = await TransactionModel.create({
      user: userId,
      account: account._id,
      amount: numAmount,
      type: "debit",
      isSuccess: true,
      remark: `ATM Cash Withdrawal (Card •••• ${last4})`,
    });

    return {
      msg: `₹${numAmount.toLocaleString("en-IN")} dispensed successfully! Take your cash.`,
      withdrawnAmount: numAmount,
      remainingBalance: account.amount,
      accountNo: account.account_no,
      cardLast4: last4,
      transactionId: txn._id,
      date: txn.createdAt,
    };
  }
}

module.exports = AtmCardService;
