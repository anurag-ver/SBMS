const express = require("express");
const router = express.Router();
const AtmCardController = require("../../controller/AtmCardController");
const AuthMiddleware = require("../../middleware/AuthMiddleware");

// All ATM routes require user authentication
router.use(AuthMiddleware);

router.get("/my-cards", AtmCardController.getUserCards);
router.get("/", AtmCardController.getUserCards);
router.post("/apply", AtmCardController.applyNewCard);
router.post("/toggle-block", AtmCardController.toggleBlockCard);
router.post("/change-pin", AtmCardController.changePin);
router.post("/update-limits", AtmCardController.updateLimits);
router.post("/withdraw", AtmCardController.withdrawViaAtm);

module.exports = router;
