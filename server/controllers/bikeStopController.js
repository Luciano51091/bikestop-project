const { default: mongoose } = require("mongoose");
const BikeStop = require("../models/BikeStop");
const User = require("../models/User");

exports.createStop = async (req, res) => {
  try {
    const { name, description, category, longitude, latitude, services, hazardType, imageUrl } = req.body;

    if (!name || !longitude || !latitude || !category) {
      return res.status(400).json({ msg: "Nome, posizione e categoria sono obbligatori" });
    }

    const newStop = new BikeStop({
      name,
      description,
      category,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      services,
      hazardType: hazardType || null,
      status: "active",
      author: req.user.id,
      imageUrl: imageUrl || "",
    });

    const savedStop = await newStop.save();

    await mongoose.model("User").findByIdAndUpdate(req.user.id, {
      $inc: { "stats.stopsCreated": 1 },
    });

    res.status(201).json(savedStop);
  } catch (err) {
    console.error("ERRORE BACKEND:", err.message);
    res.status(500).send("Errore nel salvataggio del punto");
  }
};

// TUTTI I PUNTOI BIKESTOP
exports.getAllStops = async (req, res) => {
  try {
    const stops = await BikeStop.find();
    res.json(stops);
  } catch (err) {
    res.status(500).send("Errore nel recupero dei punti");
  }
};

// AGGIORNA STATO (Attivo/Guasto o Tipo Pericolo)
exports.updateStatus = async (req, res) => {
  try {
    const { status, hazardType } = req.body;
    const stopToUpdate = await BikeStop.findById(req.params.id);

    if (!stopToUpdate) {
      return res.status(404).json({ msg: "BikeStop non trovato" });
    }

    const updateData = { lastVerified: Date.now() };

    if (status !== undefined) {
      updateData.status = status === "funzionante" || status === "active" ? "active" : "broken";
    }

    if (hazardType !== undefined) {
      updateData.hazardType = hazardType;
      if (stopToUpdate.category === "pericolo" && hazardType !== null) {
        updateData.name = `Pericolo: ${hazardType}`;
      }
    }

    const updatedStop = await BikeStop.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });

    res.json(updatedStop);
  } catch (err) {
    console.error("ERRORE UPDATE STATUS:", err.message);
    res.status(500).send("Errore nell'aggiornamento dello stato: " + err.message);
  }
};

// ELIMINA UN PUNTO
exports.deleteStop = async (req, res) => {
  try {
    const stop = await BikeStop.findById(req.params.id);
    if (!stop) return res.status(404).json({ msg: "Punto non trovato" });

    const isAuthor = stop.author.toString() === req.user.id;
    const isHazard = stop.category === "pericolo";

    if (!isAuthor && !isHazard) {
      return res.status(401).json({ msg: "Non autorizzato a eliminare questo punto" });
    }

    await stop.deleteOne();
    res.json({ msg: "Punto rimosso con successo" });
  } catch (err) {
    res.status(500).send("Errore nella rimozione");
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const stop = await BikeStop.findById(req.params.id);

    if (!stop) return res.status(404).json({ msg: "Punto non trovato" });

    const newComment = {
      user: req.user.id,
      userName: req.user.username || req.user.email || "Ciclista Anonimo",
      text: text,
      date: Date.now(),
    };

    stop.comments.unshift(newComment);
    await stop.save();
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { "stats.totalComments": 1 },
    });

    res.json(stop.comments);
  } catch (err) {
    console.error("ERRORE AGGIUNTA COMMENTO:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.rating = async (req, res) => {
  try {
    const stop = await BikeStop.findByIdAndUpdate(req.params.id, { $inc: { verifications: 1 }, lastVerified: Date.now() }, { returnDocument: "after" });

    if (!stop) return res.status(404).json({ msg: "Punto non trovato" });

    const User = require("../models/User");
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { "stats.totalVerifications": 1 },
    });

    stop.verifiedBy.push(req.user.id);
    await stop.save();

    res.json(stop);
  } catch (err) {
    console.error("ERRORE RATING:", err.message);
    res.status(500).send("Errore nell'aggiornamento della verifica");
  }
};

exports.verifyStop = async (req, res) => {
  try {
    const stop = await BikeStop.findById(req.params.id);
    if (!stop) return res.status(404).json({ msg: "Punto non trovato" });

    const incomingStatus = req.body.status;
    const finalStatus = incomingStatus === "broken" || incomingStatus === "guasto" ? "broken" : "active";

    if (stop.verifiedBy.includes(req.user.id)) {
      return res.status(400).json({ msg: "Hai già verificato questo punto" });
    }

    stop.verifiedBy.push(req.user.id);
    stop.status = finalStatus;
    stop.lastVerified = Date.now();
    stop.verifications = (stop.verifications || 0) + 1;

    if (finalStatus === "active") {
      stop.ratings.works = (stop.ratings.works || 0) + 1;
    } else {
      stop.ratings.notWorks = (stop.ratings.notWorks || 0) + 1;
    }

    await stop.save();

    await User.findByIdAndUpdate(req.user.id, {
      $inc: { "stats.totalVerifications": 1 },
    });

    res.json(stop);
  } catch (err) {
    console.error("ERRORE RATING:", err.message);
    res.status(500).json({ msg: "Errore validazione database", error: err.message });
  }
};

exports.getUserStops = async (req, res) => {
  try {
    const stops = await BikeStop.find({ author: req.user.id });
    res.json(stops);
  } catch (err) {
    console.error("ERRORE RECUPERO PUNTI UTENTE:", err.message);
    res.status(500).send("Errore nel recupero dei tuoi punti");
  }
};

exports.rateStop = async (req, res) => {
  try {
    const { rating } = req.body;
    const stop = await BikeStop.findById(req.params.id);

    if (!stop) return res.status(404).json({ msg: "Punto non trovato" });

    if (stop.ratings.ratedBy.includes(req.user.id)) {
      return res.status(400).json({ msg: "Hai già dato un voto a questa struttura" });
    }

    if (!["bar", "alloggio"].includes(stop.category)) {
      return res.status(400).json({ msg: "Voto non consentito per questa categoria" });
    }

    stop.ratings.starSum = (stop.ratings.starSum || 0) + Number(rating);
    stop.ratings.starCount = (stop.ratings.starCount || 0) + 1;
    stop.ratings.averageRating = stop.ratings.starSum / stop.ratings.starCount;

    stop.ratings.ratedBy.push(req.user.id);

    await stop.save();

    res.json(stop);
  } catch (err) {
    console.error("ERRORE RATING:", err.message);
    res.status(500).json({ msg: "Errore nel salvataggio del voto" });
  }
};
