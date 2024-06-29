const modelRound = require("../models/roundModel");

exports.create = (req, res) => {
  const { duration, roomId } = req.body;
  if (duration && roomId) {
    if (typeof duration !== "number" || typeof roomId !== "number") {
      return res.status(400).json({
        error: "duration and roomId must be numbers",
        errorCode: 5000,
      });
    } else {
      const db = req.db;
      const newRound = new modelRound(1, duration, roomId);
      const sqlQuery =
        "INSERT INTO Round (status, duration, room_id) VALUES (?, ?, ?)";
      db.run(
        sqlQuery,
        [newRound.status, newRound.duration, newRound.roomId],
        function (err) {
          if (err) {
            return res
              .status(500)
              .json({ error: "Internal server error", errorCode: 5001 });
          }

          res.status(200).json({
            message: "Round created successfully",
            roundId: this.lastID,
          });
        }
      );
    }
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 5002 });
  }
};

exports.disable = (req, res) => {
  const db = req.db;
  const roundId = req.params.id;

  if (roundId) {
    if (isNaN(roundId)) {
      return res.status(400).json({
        error: "id must be a number",
        errorCode: 5011,
      });
    } else {
      const sqlQuery = "UPDATE Round SET status = 0 WHERE round_id = ?";
      db.run(sqlQuery, roundId, function (err) {
        if (err) {
          return res
            .status(500)
            .json({ error: "Internal server error", errorCode: 5010 });
        }
        res.status(200).json({
          message: "Round disabled successfully",
          numberRowsUpdated: this.changes,
        });
      });
    }
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 5012 });
  }
};

exports.get = (req, res) => {
  const db = req.db;
  const roundId = req.params.id;

  if (roundId) {
    if (isNaN(roundId)) {
      return res.status(400).json({
        error: "id must be a number",
        errorCode: 5021,
      });
    } else {
      const sqlQuery = "SELECT * FROM Round WHERE round_id = ? AND status = 1";
      db.all(sqlQuery, roundId, (err, results) => {
        if (results.length === 0) {
          res.status(400).json({ error: "Invalid data", errorCode: 5020 });
        } else {
          res.status(200).json({
            id: results[0].round_id,
            status: results[0].status,
            duration: results[0].duration,
            roomId: results[0].room_id,
          });
        }
      });
    }
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 5022 });
  }
};

exports.getBets = (req, res) => {
  const db = req.db;
  const roundId = req.params.id;

  if (roundId) {
    if (isNaN(roundId)) {
      return res.status(400).json({
        error: "id must be a number",
        errorCode: 5032,
      });
    } else {
      const sqlQueryRound =
        "SELECT * FROM Round WHERE round_id = ? AND status = 1";
      db.get(sqlQueryRound, roundId, (err, round) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Internal server error", errorCode: 5030 });
        }

        if (!round) {
          return res
            .status(404)
            .json({ error: "Round not found", errorCode: 5031 });
        }

        const sqlQueryBetsRound = `
        SELECT Bet.*, User.pseudo 
        FROM Bet 
        JOIN User ON Bet.user_id = User.user_id 
        WHERE Bet.round_id = ?`;

        db.all(sqlQueryBetsRound, roundId, (err, results) => {
          if (results.length === 0) {
            res.status(200).json({ msg: "No bets in this round" });
          } else {
            res.status(200).json({
              bets: results,
            });
          }
        });
      });
    }
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 5033 });
  }
};
