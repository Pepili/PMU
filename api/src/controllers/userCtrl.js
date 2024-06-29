const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const regexEmail =
  /^[a-zA-Z0-9.!#$%&'*+\\\/=?^_`{|}~\-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9\-]{2,63}$/;
const regexPassword =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
const modelUser = require("../models/userModel");

exports.signup = (req, res) => {
  const { pseudo, email, password } = req.body;
  if (pseudo && email && password) {
    const lowerCaseEmail = email.toLowerCase();
    if (
      typeof pseudo !== "string" ||
      typeof lowerCaseEmail !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        error: "pseudo, email & password must be strings",
        errorCode: 1005,
      });
    } else {
      if (!regexEmail.test(lowerCaseEmail)) {
        return res.status(400).json({
          error: "Please fill in the form fields correctly",
          errorCode: 1000,
        });
      } else if (!regexPassword.test(password)) {
        return res.status(400).json({
          error:
            "Your password must contain at least 8 characters, one lower case, one upper case, one number and one special character",
          errorCode: 1001,
        });
      } else {
        const db = req.db;
        const sel = bcrypt.genSaltSync(10);
        const hachage = bcrypt.hashSync(password, sel);
        // Création d'une instance d'utilisateur avec les données reçues
        const newUser = new modelUser(pseudo, lowerCaseEmail, hachage);
        //requête SQL
        const sqlQuery =
          "INSERT INTO User (pseudo, email, password) VALUES (?, ?, ?)";
        // Exécution de la requête
        db.run(
          sqlQuery,
          [newUser.pseudo, newUser.email, newUser.password],
          function (err) {
            if (err) {
              if (err.code == "SQLITE_CONSTRAINT") {
                return res
                  .status(409)
                  .json({ error: "Email already exists", errorCode: 1002 });
              } else {
                return res
                  .status(500)
                  .json({ error: "Internal server error", errorCode: 1003 });
              }
            }
            res.status(200).json({
              message: "User created successfully",
              userId: this.lastID,
            });
          }
        );
      }
    }
  } else {
    res.status(400).json({ error: "missing data", errorCode: 1004 });
  }
};

exports.login = (req, res) => {
  const db = req.db;
  const { email, password } = req.query;
  if (email && password) {
    const lowerCaseEmail = email.toLowerCase();
    if (typeof lowerCaseEmail !== "string" || typeof password !== "string") {
      return res.status(400).json({
        error: "email & password must be strings",
        errorCode: 1014,
      });
    } else {
      const sqlQuery = "SELECT * FROM user WHERE email = ?";
      db.all(sqlQuery, [lowerCaseEmail], (err, results) => {
        if (results.length === 0) {
          res.status(400).json({ error: "Invalid data", errorCode: 1010 });
          return;
        } else {
          bcrypt
            .compare(password, results[0].password)
            .then((valid) => {
              if (!valid) {
                return res
                  .status(400)
                  .json({ error: "wrong password", errorCode: 1011 });
              }
              res.status(200).json({
                pseudo: results[0].pseudo,
                id: results[0].user_id,
                token: jwt.sign(
                  { id: results[0].user_id },
                  process.env.JWT_SECRET_KEY,
                  {
                    expiresIn: "24h",
                  }
                ),
              });
            })
            .catch((error) => res.status(400).json({ error, errorCode: 1012 }));
        }
      });
    }
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 1013 });
  }
};

exports.modify = (req, res) => {
  const db = req.db;
  const { user_id, email, password, pseudo } = req.body;

  if (user_id && email && password && pseudo) {
    const lowerCaseEmail = email.toLowerCase();
    if (
      typeof user_id !== "number" ||
      typeof lowerCaseEmail !== "string" ||
      typeof password !== "string" ||
      typeof pseudo !== "string"
    ) {
      return res.status(400).json({
        error:
          "user_id must be a number || email, password & pseudo must be strings",
        errorCode: 1023,
      });
    } else {
      if (
        !regexEmail.test(lowerCaseEmail.trim()) ||
        !regexPassword.test(password.trim())
      ) {
        res.status(400).json({ error: "Invalid data", errorCode: 1020 });
      } else {
        const sel = bcrypt.genSaltSync(10);
        const hachage = bcrypt.hashSync(password, sel);
        // Requête SQL pour mettre à jour l'utilisateur avec les nouvelles valeurs
        const sqlUpdate =
          "UPDATE user SET email = ?,password = ?, pseudo = ? WHERE user_id = ?";
        db.run(sqlUpdate, [lowerCaseEmail, hachage, pseudo, user_id], (err, result) => {
          if (err) {
            if (err.code == "SQLITE_CONSTRAINT") {
              return res
                .status(409)
                .json({ error: "Email already exists", errorCode: 1025 });
            } else {
              res
                .status(500)
                .json({ error: "Internal server error", errorCode: 1021 });
              return;
            }
          }
          if (this.changes === 0) {
            res.status(400).json({ error: "User not found", errorCode: 1022 });
            return;
          }
          res.status(200).json({ message: "User modified successfully" });
        });
      }
    }
  } else {
    res.status(400).json({ error: "Missing data", errorCode: 1024 });
  }
};
