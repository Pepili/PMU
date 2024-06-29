const express = require("express");
const router = express.Router();
const roundCtrl = require("../controllers/roundCtrl.js");
const auth = require("../middlewares/authorization.middleware.js");

router.post("/", auth, roundCtrl.create);
router.put("/disable/:id", auth, roundCtrl.disable);
router.get("/:id", auth, roundCtrl.get);
router.get("/bet/:id", auth, roundCtrl.getBets);

module.exports = router;