const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // 1. Leggiamo il token dall'header della richiesta
  const token = req.header("x-auth-token");

  // 2. Controlliamo se il token non esiste
  if (!token) {
    return res.status(401).json({ msg: "Nessun token, autorizzazione negata" });
  }

  // 3. Verifichiamo il token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Aggiungiamo l'utente (decodificato dal token) alla richiesta
    req.user = decoded.user;

    // Passiamo al prossimo passaggio (il controller)
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token non valido" });
  }
};
