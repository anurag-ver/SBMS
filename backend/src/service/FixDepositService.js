const { FixDepositModel } = require("../models/FixDeposit.model");
const { AccountModel } = require("../models/Account.model");
const { TransactionModel } = require("../models/Transaction.model");
const ApiError = require("../utils/ApiError");

const generateFDNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000);
};

const getInterestRate = (months) => {
  const m = Number(months);
  if (m < 12) return 6.5;
  if (m < 24) return 7.0;
  if (m < 36) return 7.5;
  if (m < 60) return 7.8;
  return 8.2;
};

const calculateMaturity = (principal, rate, months) => {
  const p = Number(principal);
  const r = Number(rate);
  const m = Number(months);
  const t = m / 12; // years
  // Quarterly compounding: A = P * (1 + r / 400)^(4 * t)
  const maturity = p * Math.pow(1 + r / 400, 4 * t);
  return Math.round(maturity * 100) / 100;
};

class FixDepositService {
  /**
   * Preview interest calculation
   */
  static async calculateReturns(body) {
    const { amount, months } = body;
    const numAmount = Number(amount) || 10000;
    const numMonths = Number(months) || 12;

    const rate = getInterestRate(numMonths);
    const maturityAmount = calculateMaturity(numAmount, rate, numMonths);
    const totalInterest = Math.round((maturityAmount - numAmount) * 100) / 100;

    return {
      principal: numAmount,
      months: numMonths,
      interestRate: rate,
      totalInterest,
      maturityAmount,
    };
  }

  /**
   * Create New Fixed Deposit
   */
  static async createFD(userId, body) {
    const { account_no, amount, months } = body;
    const numAmount = Number(amount);
    const numMonths = Number(months) || 12;

    if (!account_no) {
      throw new ApiError(400, "Bank account number is required to fund FD");
    }
    if (!numAmount || numAmount < 1000) {
      throw new ApiError(400, "Minimum Fixed Deposit investment is ₹1,000");
    }
    if (numMonths < 3) {
      throw new ApiError(400, "Minimum tenure is 3 months");
    }

    const account = await AccountModel.findOne({ account_no, user: userId });
    if (!account) {
      throw new ApiError(404, "Funding Bank Account Not Found");
    }

    if (account.amount < numAmount) {
      throw new ApiError(
        400,
        `Insufficient balance in A/C ${account_no}. Available: ₹${account.amount.toLocaleString("en-IN")}`
      );
    }

    const rate = getInterestRate(numMonths);
    const maturityAmount = calculateMaturity(numAmount, rate, numMonths);

    // Calculate Maturity Date
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + numMonths);

    let fdNumber = generateFDNumber();
    let exists = await FixDepositModel.findOne({ fd_number: fdNumber });
    while (exists) {
      fdNumber = generateFDNumber();
      exists = await FixDepositModel.findOne({ fd_number: fdNumber });
    }

    // Deduct principal from source account
    account.amount -= numAmount;
    await account.save();

    // Create FD record
    const newFD = await FixDepositModel.create({
      user: userId,
      account: account._id,
      amount: numAmount,
      interest_rate: rate,
      months: numMonths,
      maturity_amount: maturityAmount,
      maturity_date: maturityDate,
      isClaimed: false,
      fd_number: fdNumber,
    });

    // Create debit transaction
    await TransactionModel.create({
      user: userId,
      account: account._id,
      amount: numAmount,
      type: "debit",
      isSuccess: true,
      remark: `FD Investment #${fdNumber} (${numMonths}M @ ${rate}%)`,
    });

    return {
      msg: `Fixed Deposit #${fdNumber} created successfully! Guaranteed Maturity: ₹${maturityAmount.toLocaleString("en-IN")}`,
      fd: newFD,
      updatedAccountBalance: account.amount,
    };
  }

  /**
   * Get all user Fixed Deposits & stats
   */
  static async getAllFDs(userId) {
    const fds = await FixDepositModel.find({ user: userId })
      .populate("account", "account_no ac_type")
      .sort({ createdAt: -1 });

    const activeFDs = fds.filter((f) => !f.isClaimed);
    const totalInvested = activeFDs.reduce((sum, f) => sum + (f.amount || 0), 0);
    const totalMaturityValue = activeFDs.reduce((sum, f) => sum + (f.maturity_amount || 0), 0);
    const totalReturns = Math.round((totalMaturityValue - totalInvested) * 100) / 100;

    return {
      fds,
      stats: {
        totalInvested,
        totalMaturityValue,
        totalReturns,
        activeCount: activeFDs.length,
        claimedCount: fds.length - activeFDs.length,
      },
    };
  }

  /**
   * Claim / Break Fixed Deposit (Credit back to account)
   */
  static async claimFD(userId, body) {
    const { fd_id } = body;
    if (!fd_id) {
      throw new ApiError(400, "Fixed Deposit ID is required");
    }

    const fd = await FixDepositModel.findOne({ _id: fd_id, user: userId });
    if (!fd) {
      throw new ApiError(404, "Fixed Deposit not found");
    }

    if (fd.isClaimed) {
      throw new ApiError(400, "This Fixed Deposit has already been liquidated and claimed");
    }

    const account = await AccountModel.findById(fd.account);
    if (!account) {
      throw new ApiError(404, "Associated bank account not found to credit payout");
    }

    const isMatured = new Date() >= new Date(fd.maturity_date);
    let payoutAmount = fd.maturity_amount;

    // If premature break before maturity date: payout is principal + 5% simple interest accrued
    if (!isMatured) {
      const daysInvested = Math.max(
        1,
        Math.floor((Date.now() - new Date(fd.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      );
      const prematureInterest = Math.round(fd.amount * 0.05 * (daysInvested / 365) * 100) / 100;
      payoutAmount = fd.amount + prematureInterest;
    }

    account.amount += payoutAmount;
    await account.save();

    fd.isClaimed = true;
    fd.claimedAt = new Date();
    await fd.save();

    await TransactionModel.create({
      user: userId,
      account: account._id,
      amount: payoutAmount,
      type: "credit",
      isSuccess: true,
      remark: isMatured
        ? `FD Maturity Payout (FD #${fd.fd_number})`
        : `Premature FD Liquidation (FD #${fd.fd_number})`,
    });

    return {
      msg: `₹${payoutAmount.toLocaleString("en-IN")} credited to A/C ${account.account_no} successfully!`,
      payoutAmount,
      isMatured,
      fd,
      updatedAccountBalance: account.amount,
    };
  }
}

module.exports = FixDepositService;
