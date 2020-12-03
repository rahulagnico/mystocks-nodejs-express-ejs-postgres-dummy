const path = require("path");
const express = require("express");
const userController = require(path.join(__dirname, "..", "controller", "user-controller"));

const router = express.Router();

router.get("/", userController.getHome);

router.get("/wallet", userController.getWallet);

router.get("/stocks", userController.getStocks);

router.post("/buy-stock",userController.buyStock);

router.get("/stock-holdings", userController.getStockHoldings);

router.post("/sell-stock",userController.sellStock);

module.exports = router;