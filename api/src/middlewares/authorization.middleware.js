const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.id;
    if (req.body.user_id && req.body.user_id !== userId) {
      res.status(401).json({
        error: "Invalid user ID",
        errorCode: 9999
      });
    } else {
      next();
    }
  } catch (error) {
    res.status(401).json({
      error: error,
      errorCode: 9998
    });
  }
};
