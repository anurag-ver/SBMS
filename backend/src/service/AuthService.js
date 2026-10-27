const { UserModel } = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const bcryptjs = require("bcryptjs");
const JWTService = require("../utils/JwtService");
const { AccountModel } = require("../models/Account.model");
const { TransactionModel } = require("../models/Transaction.model");
const { FixDepositModel } = require("../models/FixDeposit.model");
const { AtmCardModel } = require("../models/AtmCard.model");

const generateAccountNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000);
};

class AuthService {
  static async loginUser(body) {
    const { email, password } = body;
    const check_exist = await UserModel.findOne({ email: email.toLowerCase() });
    if (!check_exist) {
      throw new ApiError(400, "No Account Found");
    }
    const isMatch = await bcryptjs.compare(password, check_exist.password);
    if (!isMatch) {
      throw new ApiError(400, "Invalid Credentials");
    }

    const token = JWTService.generateToken(check_exist._id);
    return {
      msg: "Login Success",
      token,
    };
  }

  static async registerUser(body) {
    const { name, email, password, acc_type } = body;
    const normalizedEmail = email.toLowerCase();

    const check_email = await UserModel.findOne({ email: normalizedEmail });
    if (check_email) {
      throw new ApiError(400, "Email Already Exists");
    }

    const user = await UserModel.create({
      name,
      email: normalizedEmail,
      password,
      acc_type: acc_type || "saving",
    });

    const initialAccountNo = generateAccountNumber();
    const ac = await AccountModel.create({
      user: user._id,
      amount: 0,
      ac_type: acc_type || "saving",
      account_no: initialAccountNo,
    });

    await TransactionModel.create({
      user: user._id,
      account: ac._id,
      amount: 0,
      type: "credit",
      isSuccess: true,
      remark: "Account Opening",
    });

    const token = JWTService.generateToken(user._id);
    return {
      msg: "Register Success",
      token,
    };
  }

  static async profileUser(userId) {
    const user = await UserModel.findById(userId).select("name email acc_type createdAt -_id");
    if (!user) {
      throw new ApiError(401, "Profile Not Found");
    }

    let accounts = await AccountModel.find({ user: userId }).select("_id amount ac_type account_no createdAt");

    if (!accounts || accounts.length === 0) {
      const initialAccountNo = generateAccountNumber();
      const newAc = await AccountModel.create({
        user: userId,
        amount: 0,
        ac_type: user.acc_type || "saving",
        account_no: initialAccountNo,
      });

      await TransactionModel.create({
        user: userId,
        account: newAc._id,
        amount: 0,
        type: "credit",
        isSuccess: true,
        remark: "Account Opening",
      });

      accounts = [newAc];
    }

    const totalAmount = accounts.reduce((sum, item) => sum + (item.amount || 0), 0);

    const activeFDs = await FixDepositModel.find({ user: userId, isClaimed: false });
    const totalFdAmount = activeFDs.reduce((sum, item) => sum + (item.amount || 0), 0);

    const userCards = await AtmCardModel.find({ user: userId }).select(
      "card_number card_type card_network is_blocked expiry_month expiry_year"
    );

    return {
      ...user.toObject(),
      account_no: accounts,
      amount: totalAmount,
      total_amount: totalAmount,
      fd_amount: totalFdAmount,
      fdCount: activeFDs.length,
      atms: userCards,
    };
  }
}

module.exports = AuthService;