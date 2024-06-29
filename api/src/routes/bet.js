const express = require("express");
const router = express.Router();
const betCtrl = require("../controllers/betCtrl.js");
const auth = require("../middlewares/authorization.middleware.js");

router.post("/", auth, betCtrl.create);

module.exports = router;