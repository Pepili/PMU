const express = require("express");
const router = express.Router();
const messageCtrl = require("../controllers/messageCtrl.js");
const auth = require("../middlewares/authorization.middleware.js");

router.post("/", auth, messageCtrl.create);
router.delete("/:id", auth, messageCtrl.delete);

module.exports = router;