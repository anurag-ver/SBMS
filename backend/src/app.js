const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const notFoundError = require("./middleware/404Handling");
const ApiError = require("./utils/ApiError");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

app.use("/api/v1", require("./router"));

app.get("/", (req, res) => {
  res.send("SBMS Banking API is running!");
});

app.use("", (req, res, next) => {
  next(new ApiError(404, "Not Found"));
});

app.use(notFoundError);

module.exports = app;
