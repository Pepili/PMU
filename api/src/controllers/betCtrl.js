const modelBet = require("../models/betModel");

exports.create = (req, res) => {
  const { sipsNumber, horseId, userId, roundId } = req.body;
  if (sipsNumber && horseId && userId && roundId) {
    if (
      typeof sipsNumber !== "number" ||
      typeof horseId !== "number" ||
      typeof roundId !== "number" ||
      typeof userId !== "number"
    ) {
      return res.status(400).json({
        error: "sipsNumber, horseId, userId and roundId must be numbers",
        errorCode: 3000,
      });
    } else {
      const db = req.db;

      const sqlQueryRound =
        "SELECT * FROM Round WHERE round_id = ? AND status = 1";
      db.get(sqlQueryRound, roundId, (err, round) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Internal server error", errorCode: 3003 });
        }

        if (!round) {
          return res
            .status(404)
            .json({ error: "Round not found", errorCode: 3004 });
        }

        const newBet = new modelBet(sipsNumber, horseId, userId, roundId);
        const sqlQuery =
          "INSERT INTO Bet (sips_number, horse_id, user_id, round_id) VALUES (?, ?, ?, ?)";
        db.run(
          sqlQuery,
          [newBet.sipsNumber, newBet.horseId, newBet.userId, newBet.roundId],
          function (err) {
            if (err) {
              if (err.code == "SQLITE_CONSTRAINT") {
                return res
                  .status(409)
                  .json({
                    error: "This user has already made a bet on this round",
                    errorCode: 3005,
                  });
              } else {
                return res
                  .status(500)
                  .json({ error: "Internal server error", errorCode: 3001 });
              }
            }
            res
              .status(200)
              .json({
                message: "Bet created successfully",
                betId: this.lastID,
              });
          }
        );
      });
    }
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 3002 });
  }
};
