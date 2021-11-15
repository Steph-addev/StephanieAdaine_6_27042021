const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.HIDDEN_TOKEN);
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw "Invalid user ID";
    } else {
      console.log(token);
      console.log(process.env.HIDDEN_TOKEN);
      next();
    }
  } catch (error) {
    res.status(401).json({
      error: error | "Requête non authentifiée",
    });
  }
};
