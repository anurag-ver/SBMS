const FixDepositService = require("../service/FixDepositService");

class FixDepositController {
  static async calculateReturns(req, res, next) {
    try {
      const res_obj = await FixDepositService.calculateReturns(req.body);
      res.status(200).send(res_obj);
    } catch (error) {
      next(error);
    }
  }

  static async createFD(req, res, next) {
    try {
      const res_obj = await FixDepositService.createFD(req.user, req.body);
      res.status(201).send(res_obj);
    } catch (error) {
      next(error);
    }
  }

  static async getAllFDs(req, res, next) {
    try {
      const res_obj = await FixDepositService.getAllFDs(req.user);
      res.status(200).send(res_obj);
    } catch (error) {
      next(error);
    }
  }

  static async claimFD(req, res, next) {
    try {
      const res_obj = await FixDepositService.claimFD(req.user, req.body);
      res.status(200).send(res_obj);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FixDepositController;
