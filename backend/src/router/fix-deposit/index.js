const express = require("express");
const router = express.Router();
const FixDepositController = require("../../controller/FixDepositController");
const AuthMiddleware = require("../../middleware/AuthMiddleware");

// Calculation can be accessed with or without auth, but let's mount calculation
router.post("/calculate", FixDepositController.calculateReturns);

// Protected routes
router.use(AuthMiddleware);

router.get("/all", FixDepositController.getAllFDs);
router.get("/", FixDepositController.getAllFDs);
router.post("/create", FixDepositController.createFD);
router.post("/claim", FixDepositController.claimFD);

module.exports = router;
