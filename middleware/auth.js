const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("--------New request-----------");
    console.log("token = ", token);
    const decodedToken = jwt.verify(token, process.env.HIDDEN_TOKEN);
    const userId = decodedToken.userId;
    console.log("userID = ", userId);

    if (req.body.userId && req.body.userId !== userId) throw "Invalid user ID";
    next();
  } catch (error) {
    res.status(401).json({
      error: new Error("Invalid request"),
    });
  }
};
