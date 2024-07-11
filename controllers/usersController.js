const bcrypt = require("bcrypt");
const User = require("../models/user");

const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    console.log("request body:", req.body);
    const hashedPassword = await bcrypt.hash(password, 10); // Il secondo argomento è il costo del calcolo del salt

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json(err);
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      res.status(400).json("user not found");
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      res.status(400).json("wrong credentials");
    }

    // Se la password corrisponde, restituisce l'utente (senza la password) come risposta
    res.status(200).json({
      _id: user._id,
      username: user.username,
    });
  } catch (err) {
    console.error("Error during user login:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { registerUser, loginUser };
