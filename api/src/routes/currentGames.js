const express = require("express");
const router = express.Router();
const currentGamesCtrl = require("../controllers/currentGamesCtrl.js");
const auth = require("../middlewares/authorization.middleware.js");

router.get("/:roundId", auth, currentGamesCtrl.get);
router.post("/:roundId", auth, currentGamesCtrl.create);
router.delete("/:roundId", auth, currentGamesCtrl.delete);
router.put("/", auth, currentGamesCtrl.update);

module.exports = router;