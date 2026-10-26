const AmountService = require("../service/AmountService");

class AmountController {
  static async addMoney(req, res, next) {
    try {
      const res_obj = await AmountService.addMoney(req.body, req.user);
      res.status(200).send(res_obj);
    } catch (error) {
      next(error);
    }
  }

  static async verifyPayment(req, res, next) {
    try {
      const res_obj = await AmountService.verifyPayment(req.body, req.body.txn_id);
      res.status(200).send(res_obj);
    } catch (error) {
      next(error);
    }
  }

  static async verifyPaymentCallback(req, res, next) {
    try {
      const res_obj = await AmountService.verifyPayment(req.body, req.params.txn_id);
      res.redirect(res_obj.url);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URI || "http://localhost:5173";
      res.redirect(`${frontendUrl}/transactions?payment=failed&msg=${encodeURIComponent(error.message)}`);
    }
  }

  static async addNewAccount(req, res, next) {
    try {
      const res_obj = await AmountService.addNewAccount(req.user, req.body);
      res.status(201).send(res_obj);
    } catch (error) {
      next(error);
    }
  }

  static async getAllAccounts(req, res, next) {
    try {
      const res_obj = await AmountService.getAllAccounts(req.user);
      res.status(200).send(res_obj);
    } catch (error) {
      next(error);
    }
  }

  static async getAllTransactions(req, res, next) {
    try {
      const res_obj = await AmountService.getAllTransactions(req.user);
      res.status(200).send(res_obj);
    } catch (error) {
      next(error);
    }
  }

  static async transferMoney(req, res, next) {
    try {
      const res_obj = await AmountService.transferMoney(req.body, req.user);
      res.status(200).send(res_obj);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AmountController;
