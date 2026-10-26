const express = require("express");
const router = express.Router();
const AuthRoute = require("./auth");
const AmountRoute = require("./amount");
const FixDepositRoute = require("./fix-deposit");

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
];

routes.forEach((cur) => {
  router.use(cur.path, cur.route);
});

module.exports = router;
