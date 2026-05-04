const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "Nessun token, autorizzazione negata" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.user.id).select("-password");
    if (!user) return res.status(401).json({ msg: "Utente non trovato" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token non valido" });
  }
};
