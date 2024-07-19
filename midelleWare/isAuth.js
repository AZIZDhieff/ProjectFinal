const jwt = require("jsonwebtoken");
const User = require("../Models/user");
const isAuth = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    if (!token) {
      return res.send({ msg: "No token !" });
    }
    const decoded = await jwt.verify(token, "jhghsd");
    console.log(decoded, "testtt");

    const user = await User.findById(decoded.id);
    console.log(user, "userrrr");
    if (!user) {
      return res.send({ msg: "no user with this token !" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.send({ msg: "token not valid" });
  }
};

module.exports = isAuth;
