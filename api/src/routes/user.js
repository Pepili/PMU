const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/userCtrl.js");

router.post("/", userCtrl.signup);
router.get("/", userCtrl.login);
router.put("/", userCtrl.modify);

module.exports = router;
