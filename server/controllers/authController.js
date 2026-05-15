const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const BikeStop = require("../models/BikeStop");
const mongoose = require("mongoose");

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
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password").populate("favorites");

    // Conteggio punti creati
    const stopsCreated = await BikeStop.countDocuments({ author: userId });

    // Conteggio commenti
    const stopsWithMyComments = await BikeStop.find({ "comments.user": userId });
    let totalComments = 0;
    stopsWithMyComments.forEach((stop) => {
      totalComments += stop.comments.filter((c) => c.user && c.user.toString() === userId.toString()).length;
    });

    // !!! CORREZIONE: Convertiamo l'id in ObjectId per garantire che MongoDB trovi la corrispondenza nell'array
    let convertedId = userId;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      convertedId = new mongoose.Types.ObjectId(userId);
    }

    // Cerchiamo i documenti dove l'array 'verifiedBy' contiene il nostro ID (stringa o ObjectId)
    const totalVerifications = await BikeStop.countDocuments({
      $or: [{ verifiedBy: userId }, { verifiedBy: convertedId }],
    });

    console.log(`[BACKEND getMe] Conteggio reale verifiche per utente ${userId}:`, totalVerifications);

    res.json({
      ...user._doc,
      stats: {
        stopsCreated,
        totalComments,
        totalVerifications, // Ora questo manderà il numero reale!
      },
    });
  } catch (err) {
    console.error("Errore in getMe:", err.message);
    res.status(500).send("Errore del server");
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { profileImage, username, email, password } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "Utente non trovato" });
    }

    const updateData = {};

    if (profileImage) updateData.profileImage = profileImage;
    if (username) updateData.username = username;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ msg: "Questa email è già associata a un altro account" });
      }
      updateData.email = email;
    }

    if (password) {
      if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ msg: "La password deve contenere almeno 6 caratteri" });
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true }).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.error("ERRORE AGGIORNAMENTO PROFILO:", err.message);
    res.status(500).send("Errore nel server");
  }
};
const handleUpdate = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.put("http://localhost:5000/api/auth/update", { username: newUsername }, { headers: { "x-auth-token": token } });
    setCurrentUser(res.data);
    alert("Profilo aggiornato!");
  } catch (err) {
    console.error(err);
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const stopId = req.params.stopId;

    const isFavorite = user.favorites.includes(stopId);

    if (isFavorite) {
      user.favorites = user.favorites.filter((id) => id.toString() !== stopId);
    } else {
      user.favorites.push(stopId);
    }

    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).send("Errore salvataggio preferiti");
  }
};
