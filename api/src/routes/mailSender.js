const express = require("express");
const router = express.Router();
const emailSender = require("../utils/mailSender.js");

router.post("/", emailSender.sendEmail);

module.exports = router;