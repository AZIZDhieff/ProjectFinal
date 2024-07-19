const express = require("express");
const User = require("../Models/user");
const Reservation = require("../Models/reservation");
const router = express.Router();
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const isAuth = require("../midelleWare/isAuth");
//register new user

router.use(function (req, res, next) {
  res.header("Access-Control-Allow-origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "*");

  return next();
});

router.post("/reservation", isAuth, async (req, res) => {
  const { carModel, plateNumber, reservations } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    console.log("User:", req.user);
    console.log("Received data:", { carModel, plateNumber, reservations });

    const id = req.user._id;

    if (!carModel || !plateNumber || !reservations) {
      return res
        .status(400)
        .json({ status: false, message: "Missing required fields" });
    }

    let rev = new Reservation({
      carModel,
      plateNumber,
      id,
      reservations,
    });

    const savedRev = await rev.save();
    console.log("Reservation saved:", savedRev);
    res.json({ status: true, reservation: savedRev });
  } catch (error) {
    console.error("Error in reservation endpoint:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  const { name, email, lastName, password } = req.body;
  let user = await User.findOne({ email });
  if (user) {
    return res.send({ msg: "user already exists !" });
  }
  user = new User({
    name,
    email,
    password,
    lastName,
  });
  const salt = 10;
  let hashedPassword = await bcrypt.hash(password, salt);
  user.password = hashedPassword;
  await user.save();

  const payload = {
    id: user._id,
  };
  var token = jwt.sign(payload, "jhghsd");

  res.send({ msg: "user added with success !", user, token });
});

//login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).send({ msg: "User not found!" });
    }

    let isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send({ msg: "Bad credentials!" });
    }

    const payload = { id: user._id };
    var token = jwt.sign(payload, "jhghsd", { expiresIn: "1h" });

    res.send({ msg: "User logged in successfully!", user, token: token });
  } catch (error) {
    console.error("Server error during login:", error);
    res.status(500).send({ msg: "Server error" });
  }
});

//get auth user
router.get("/user", isAuth, (req, res) => {
  res.send({ user: req.user });
});

module.exports = router;
