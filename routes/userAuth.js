const express = require("express");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isAuth = require("../middleware/isAuth"); // Ensure this middleware is correctly implemented

// CORS headers
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// Register new user
router.post("/register", async (req, res) => {
  const { name, email, lastName, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).send({ msg: "User already exists!" });
    }

    user = new User({
      name,
      email,
      password,
      lastName,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "defaultsecret", {
      expiresIn: "1h",
    });

    res.status(201).send({ msg: "User added successfully!", user, token });
  } catch (error) {
    res.status(500).send({ msg: "Server error" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ msg: "User not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .send({ msg: "Bad credentials! Incorrect password" });
    }

    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "defaultsecret", {
      expiresIn: "1h",
    });

    res.send({ msg: "User logged in successfully!", user, token });
  } catch (error) {
    res.status(500).send({ msg: "Server error" });
  }
});

// Get authenticated user
router.get("/user", isAuth, (req, res) => {
  res.send({ user: req.user });
});

module.exports = router;
