const modelRoom = require("../models/roomModel");

exports.create = (req, res) => {
  const { maxNbPlayers, userIds, adminId } = req.body;
  if (maxNbPlayers && userIds && adminId) {
    if (!Array.isArray(userIds) || !userIds.every(Number.isFinite)) {
      return res.status(400).json({
        error: "userIds must be an array of numbers only",
        errorCode: 2000,
      });
    } else if (
      typeof adminId !== "number" ||
      typeof maxNbPlayers !== "number"
    ) {
      return res.status(400).json({
        error: "adminId & maxNbPlayers must be numbers",
        errorCode: 2001,
      });
    } else {
      createRoom(req, res, maxNbPlayers, userIds, adminId);
    }
  } else {
    res.status(400).json({ error: "missing data", errorCode: 2004 });
  }
};

function createRoom(req, res, maxNbPlayers, userIds, adminId) {
  const db = req.db;
  const code = Math.floor(100000 + Math.random() * 900000);
  const newRoom = new modelRoom(1, code, maxNbPlayers, adminId, userIds);
  const sqlQueryRoom =
    "INSERT INTO Room (status, code, max_nb_players, admin_id) VALUES (?, ?, ?, ?)";
  const sqlQueryUserRoom =
    "INSERT INTO User_Room (user_id, room_id) VALUES (?, ?)";
  const sqlQueryCodeRoom = "SELECT * FROM Room WHERE room_id = ?";

  const sqlQueryCodeExists = "SELECT * FROM Room WHERE code = ? AND status = 1";
  db.all(sqlQueryCodeExists, code, (err, results) => {
    if (results.length === 0) {
      db.run(
        sqlQueryRoom,
        [newRoom.status, newRoom.code, newRoom.maxNbPlayers, newRoom.adminId],
        function (err) {
          if (err) {
            return res
              .status(500)
              .json({ error: "Internal server error", errorCode: 2002 });
          }
          const roomId = this.lastID;

          const promises = userIds.map((userId) => {
            return new Promise((resolve, reject) => {
              db.run(sqlQueryUserRoom, [userId, roomId], (err) => {
                if (err) {
                  reject({
                    status: 500,
                    json: {
                      error: "Internal server error",
                      errorCode: 2003,
                    },
                  });
                }
                resolve();
              });
            });
          });

          Promise.all(promises)
            .then(() => {
              const roomId = this.lastID;
              db.all(sqlQueryCodeRoom, roomId, (err, results) => {
                if (results.length === 0) {
                  res.status(400).json({
                    error: "Can't get the room object",
                    errorCode: 2005,
                  });
                } else {
                  res.status(200).json({
                    message: "Room created successfully",
                    roomId: roomId,
                    status: results[0].status,
                    code: results[0].code,
                    maxNbPlayers: results[0].max_nb_players,
                    adminId: results[0].admin_id,
                  });
                }
              });
            })
            .catch((err) => {
              res.status(err.status).json(err.json);
            });
        }
      );
    } else {
      //Retry with a new code
      createRoom(req, res, maxNbPlayers, userIds, adminId);
    }
  });
}

exports.getByCode = (req, res) => {
  const db = req.db;
  const code = req.params.code;

  if (code) {
    const sqlQuery = "SELECT * FROM Room WHERE code = ? AND status = 1";
    db.all(sqlQuery, code, (err, results) => {
      if (results.length === 0) {
        res.status(400).json({ error: "Invalid data", errorCode: 2010 });
      } else {
        res.status(200).json({
          id: results[0].room_id,
          status: results[0].status,
          code: results[0].code,
          maxNbPlayers: results[0].max_nb_players,
          adminId: results[0].admin_id,
        });
      }
    });
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 2011 });
  }
};

exports.get = (req, res) => {
  const db = req.db;
  const roomId = Number(req.params.id);

  if (roomId) {
    const sqlQuery = "SELECT * FROM Room WHERE room_id = ? AND status = 1";
    db.all(sqlQuery, roomId, (err, results) => {
      if (results.length === 0) {
        res.status(400).json({ error: "Invalid data", errorCode: 2070 });
      } else {
        res.status(200).json({
          id: results[0].room_id,
          status: results[0].status,
          code: results[0].code,
          maxNbPlayers: results[0].max_nb_players,
          adminId: results[0].admin_id,
        });
      }
    });
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 2071 });
  }
};

exports.getPlayers = (req, res) => {
  const db = req.db;
  const roomId = req.params.id;

  if (roomId) {
    if (isNaN(roomId)) {
      return res.status(400).json({
        error: "id must be a number",
        errorCode: 2022,
      });
    } else {
      const sqlQueryRoom =
        "SELECT * FROM Room WHERE room_id = ? AND status = 1";
      db.get(sqlQueryRoom, roomId, (err, room) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Internal server error", errorCode: 2024 });
        }

        if (!room) {
          return res
            .status(404)
            .json({ error: "Room not found", errorCode: 2025 });
        }

        const sqlQueryAdmin = `
        SELECT u.user_id, u.pseudo, u.email
        FROM User AS u 
        JOIN Room AS r ON u.user_id = r.admin_id 
        WHERE r.room_id = ?`;
              const sqlQueryUsers = `
        SELECT u.user_id, u.pseudo, u.email
        FROM User AS u 
        JOIN User_Room AS ur ON u.user_id = ur.user_id 
        WHERE ur.room_id = ? AND u.user_id != (SELECT admin_id FROM Room WHERE room_id = ?)`;

        db.all(sqlQueryUsers, [roomId, roomId], (err, results) => {
          if (results.length === 0) {
            return res
              .status(400)
              .json({ error: "Invalid data", errorCode: 2020 });
          } else {
            const users = results;

            db.all(sqlQueryAdmin, roomId, (err, results) => {
              if (results.length === 0) {
                return res
                  .status(400)
                  .json({ error: "Invalid data", errorCode: 2021 });
              } else {
                res.status(200).json({
                  users: users,
                  admin: results[0],
                });
              }
            });
          }
        });
      });
    }
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 2023 });
  }
};

exports.getMessages = (req, res) => {
  const db = req.db;
  const roomId = req.params.id;

  if (roomId) {
    if (isNaN(roomId)) {
      return res.status(400).json({
        error: "id must be a number",
        errorCode: 2032,
      });
    } else {
      const sqlQueryRoom =
        "SELECT * FROM Room WHERE room_id = ? AND status = 1";
      db.get(sqlQueryRoom, roomId, (err, room) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Internal server error", errorCode: 2030 });
        }

        if (!room) {
          return res
            .status(404)
            .json({ error: "Room not found", errorCode: 2031 });
        }

        const sqlQueryMessagesRoom = "SELECT * FROM Message WHERE room_id = ?";
        db.all(sqlQueryMessagesRoom, roomId, (err, results) => {
          if (results.length === 0) {
            res.status(200).json({ msg: "No messages in this room" });
          } else {
            res.status(200).json({
              messages: results,
            });
          }
        });
      });
    }
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 2033 });
  }
};

exports.disable = (req, res) => {
  const db = req.db;
  const roomId = req.params.id;

  if (roomId) {
    if (isNaN(roomId)) {
      return res.status(400).json({
        error: "id must be a number",
        errorCode: 2041,
      });
    } else {
      const sqlQuery = "UPDATE Room SET status = 0 WHERE room_id = ?";
      db.run(sqlQuery, roomId, function (err) {
        if (err) {
          return res
            .status(500)
            .json({ error: "Internal server error", errorCode: 2040 });
        }
        res.status(200).json({
          message: "Room disabled successfully",
          numberRowsUpdated: this.changes,
        });
      });
    }
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 2042 });
  }
};

exports.deleteUser = (req, res) => {
  const roomId = req.query.roomId;
  const userId = req.query.userId;
  const db = req.db;

  if (roomId && userId) {
    if (isNaN(roomId) || isNaN(userId)) {
      return res.status(400).json({
        error: "roomId and userId must be numbers",
        errorCode: 2050,
      });
    } else {
      const sqlQuery =
        "DELETE FROM User_Room WHERE room_id = ? AND user_id = ?";
      db.run(sqlQuery, [roomId, userId], function (err) {
        if (err) {
          return res
            .status(500)
            .json({ error: "Internal server error", errorCode: 2051 });
        }
        if (this.changes === 0) {
          return res
            .status(404)
            .json({ error: "User not found in room", errorCode: 2052 });
        }
        res.status(200).json({
          message: "User removed from room successfully",
          numberRowsUpdated: this.changes,
        });
      });
    }
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 2053 });
  }
};

exports.join = (req, res) => {
  const { roomId, userId } = req.body;
  console.log(roomId, userId);
  console.log("coucou");
  const db = req.db;
  if (roomId && userId) {
    if (typeof roomId !== "number" || typeof userId !== "number") {
      return res.status(400).json({
        error: "roomId and userId must be numbers",
        errorCode: 2060,
      });
    } else {
      const sqlQueryRoom = "SELECT * FROM Room WHERE room_id = ? AND status = 1";
      db.get(sqlQueryRoom, [roomId], (err, room) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Internal server error", errorCode: 2065 });
        }
        if (!room) {
          return res
            .status(404)
            .json({ error: "Room not found or status is 0", errorCode: 2064 });
        }

        const sqlQueryUserRoom = "SELECT * FROM User_Room WHERE room_id = ? AND user_id = ?";
        db.get(sqlQueryUserRoom, [roomId, userId], (err, userRoom) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Internal server error", errorCode: 2066 });
          }
          if (userRoom) {
            return res.status(200).json({
              message: "User joined room successfully",
              numberRowsUpdated: this.changes,
            });
          }

          const sqlQuery = "INSERT INTO User_Room (room_id, user_id) VALUES (?, ?)";
          db.run(sqlQuery, [roomId, userId], function (err) {
            if (err) {
              return res
                .status(500)
                .json({ error: "Internal server error", errorCode: 2062 });
            }
            res.status(200).json({
              message: "User joined room successfully",
              numberRowsUpdated: this.changes,
            });
          });
        });
      });
    }
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 2063 });
  }
};