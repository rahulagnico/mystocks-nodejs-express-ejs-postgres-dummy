const path=require("path");
const express = require("express");
const authController=require(path.join(__dirname,"..","controller","auth-controller"));

const router = express.Router();

router.get("/", authController.getIndex);

router.post("/login", authController.login);

router.post("/register", authController.register);

router.post("/logout", authController.logout);

module.exports = router;