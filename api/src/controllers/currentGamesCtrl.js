const fs = require("fs");
const path = require("path");

exports.create = (req, res) => {
  let roundId = req.params.roundId;
  const db = req.db;

  if (roundId) {
    if (isNaN(roundId)) {
      return res.status(400).json({
        error: "roundId must be a number",
        errorCode: 6000,
        r: req.params.roundId,
      });
    } else {
      roundId = Math.round(parseFloat(req.params.roundId));

      const sqlQueryRound =
        "SELECT * FROM Round WHERE round_id = ? AND status = 1";
      db.get(sqlQueryRound, roundId, (err, round) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Internal server error", errorCode: 6001 });
        }

        if (!round) {
          return res
            .status(404)
            .json({ error: "Round not found or status is 0", errorCode: 6002 });
        }

        const newGame = req.body;

        // Read the current games
        fs.readFile(
          path.join(__dirname, "../models/currentGames.json"),
          "utf8",
          (err, data) => {
            if (err) {
              return res
                .status(500)
                .json({ error: "Internal server error", errorCode: 6003 });
            }

            const gamesData = JSON.parse(data);
            const games = gamesData.games;

            if (!games.some((game) => game.roundId === roundId)) {
              games.push(newGame);
            }

            // Write the updated games back to the file
            fs.writeFile(
              path.join(__dirname, "../models/currentGames.json"),
              JSON.stringify(gamesData, null, 2),
              "utf8",
              (err) => {
                if (err) {
                  return res
                    .status(500)
                    .json({ error: "Internal server error", errorCode: 6005 });
                }

                res.status(200).json({
                  message:
                    "Game added successfully with all horses locations at 0",
                });
              }
            );
          }
        );
      });
    }
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 6006 });
  }
};

exports.update = (req, res) => {
  const { roundId, deck, discard, inconvenientCard, positionHorse } = req.body;
  // Different validation because horseLoc can be 0
  if (
    roundId &&
    positionHorse !== undefined &&
    positionHorse !== null
  ) {
    if (
      typeof roundId !== "number"
    ) {
      return res.status(400).json({
        error:
          "roundId must be numbers",
        errorCode: 6010,
      });
    } else {
      const db = req.db;

      const sqlQueryRound =
        "SELECT * FROM Round WHERE round_id = ? AND status = 1";
      db.get(sqlQueryRound, roundId, (err, round) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Internal server error", errorCode: 6011 });
        }

        if (!round) {
          return res
            .status(404)
            .json({ error: "Round not found or status is 0", errorCode: 6012 });
        }

        const newGame = {
          roundId,
          deck,
          discard,
          inconvenientCard,
          positionHorse
        };

        // Read the current games
        fs.readFile(
          path.join(__dirname, "../models/currentGames.json"),
          "utf8",
          (err, data) => {
            if (err) {
              return res
                .status(500)
                .json({ error: "Internal server error", errorCode: 6014 });
            }

            const gamesData = JSON.parse(data);
            const games = gamesData.games;

            // Find the index of the game with the given roundId
            const gameIndex = games.findIndex(
              (game) => game.roundId === roundId
            );

            // If the game doesn't exist, return an error
            if (gameIndex === -1) {
              return res.status(400).json({
                error: "No game with the specified roundId exists",
                errorCode: 6015,
              });
            }

            // Replace the existing game with the new game
            games.splice(gameIndex, 1, newGame);

            // Write the updated games back to the file
            fs.writeFile(
              path.join(__dirname, "../models/currentGames.json"),
              JSON.stringify(gamesData, null, 2),
              "utf8",
              (err) => {
                if (err) {
                  return res
                    .status(500)
                    .json({ error: "Internal server error", errorCode: 6016 });
                }

                res.status(200).json({
                  message: "Game updated successfully",
                  newCurrentGame: newGame,
                });
              }
            );
          }
        );
      });
    }
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 6017 });
  }
};

exports.delete = (req, res) => {
  let roundId = req.params.roundId;

  if (roundId) {
    if (isNaN(roundId)) {
      return res.status(400).json({
        error: "roundId must be a number",
        errorCode: 6020,
      });
    } else {
      roundId = Math.round(parseFloat(req.params.roundId));

      // Read the current games
      fs.readFile(
        path.join(__dirname, "../models/currentGames.json"),
        "utf8",
        (err, data) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Internal server error", errorCode: 6021 });
          }

          const gamesData = JSON.parse(data);
          const games = gamesData.games;

          const gameIndex = games.findIndex((game) => game.roundId === roundId);

          if (gameIndex === -1) {
            return res.status(404).json({
              error: "No current game with the given roundId exists",
              errorCode: 6022,
            });
          }

          games.splice(gameIndex, 1);

          // Write the updated games back to the file
          fs.writeFile(
            path.join(__dirname, "../models/currentGames.json"),
            JSON.stringify(gamesData, null, 2),
            "utf8",
            (err) => {
              if (err) {
                return res
                  .status(500)
                  .json({ error: "Internal server error", errorCode: 6023 });
              }

              res.status(200).json({
                message: "Game deleted successfully",
              });
            }
          );
        }
      );
    }
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 6024 });
  }
};

exports.get = (req, res) => {
  let roundId = req.params.roundId;

  if (roundId) {
    if (isNaN(roundId)) {
      return res.status(400).json({
        error: "roundId must be a number",
        errorCode: 6030,
      });
    } else {
      roundId = Math.round(parseFloat(req.params.roundId));

      // Read the current games
      fs.readFile(
        path.join(__dirname, "../models/currentGames.json"),
        "utf8",
        (err, data) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Internal server error", errorCode: 6031 });
          }

          const gamesData = JSON.parse(data);
          const games = gamesData.games;

          const game = games.find((game) => game.roundId === roundId);
          console.log(game);
          if (!game) {
            return res.status(404).json({
              error: "No current game with the given roundId exists",
              errorCode: 6032,
            });
          }

          res.status(200).json(game);
        }
      );
    }
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 6033 });
  }
};
