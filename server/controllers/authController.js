const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!password || typeof password !== "string") {
      return res.status(400).json({ msg: "Password non valida o mancante" });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "Utente già esistente" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, email, password: hashedPassword, role: role || "user" });
    await user.save();
    res.status(201).json({ msg: "Utente registrato con successo!" });
  } catch (err) {
    console.error("Errore registrazione:", err.message);
    res.status(500).send("Errore nel server");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Credenziali non valide" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Credenziali non valide" });

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).send("Errore nel server");
  }
};

exports.getMe = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Errore del server");
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { profileImage, username } = req.body;
    const updateData = {};

    if (profileImage) updateData.profileImage = profileImage;
    if (username) updateData.username = username;

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updateData }, { new: true }).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Errore nel server");
  }
};
