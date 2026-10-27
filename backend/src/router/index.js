const express = require("express");
const router = express.Router();
const AuthRoute = require("./auth");
const AmountRoute = require("./amount");
const FixDepositRoute = require("./fix-deposit");
const AtmCardRoute = require("./atm-card");

const routes = [
  {
    path: "/auth",
    route: AuthRoute,
  },
  {
    path: "/amount",
    route: AmountRoute,
  },
  {
    path: "/fix-deposit",
    route: FixDepositRoute,
  },
  {
    path: "/fd",
    route: FixDepositRoute,
  },
  {
    path: "/atm-card",
    route: AtmCardRoute,
  },
  {
    path: "/atm",
    route: AtmCardRoute,
  },
];

routes.forEach((cur) => {
  router.use(cur.path, cur.route);
});

module.exports = router;
