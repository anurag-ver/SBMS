const AtmCardService = require("../service/AtmCardService");

class AtmCardController {
  static async getUserCards(req, res, next) {
    try {
      const res_obj = await AtmCardService.getUserCards(req.user);
      res.status(200).send(res_obj);
    } catch (error) {
      next(error);
    }
  }

  static async applyNewCard(req, res, next) {
    try {
      const res_obj = await AtmCardService.applyNewCard(req.user, req.body);
      res.status(201).send(res_obj);
    } catch (error) {
      next(error);
    }
  }

  static async toggleBlockCard(req, res, next) {
    try {
      const res_obj = await AtmCardService.toggleBlockCard(req.user, req.body);
      res.status(200).send(res_obj);
    } catch (error) {
      next(error);
    }
  }

  static async changePin(req, res, next) {
    try {
      const res_obj = await AtmCardService.changePin(req.user, req.body);
      res.status(200).send(res_obj);
    } catch (error) {
      next(error);
    }
  }

  static async updateLimits(req, res, next) {
    try {
      const res_obj = await AtmCardService.updateLimits(req.user, req.body);
      res.status(200).send(res_obj);
    } catch (error) {
      next(error);
    }
  }

  static async withdrawViaAtm(req, res, next) {
    try {
      const res_obj = await AtmCardService.withdrawViaAtm(req.user, req.body);
      res.status(200).send(res_obj);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AtmCardController;
