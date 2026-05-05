const BikeStop = require("../models/BikeStop");

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
    res.status(201).json(savedStop);
  } catch (err) {
    console.error("ERRORE BACKEND:", err.message);
    res.status(500).send("Errore nel salvataggio del punto");
  }
};

// TUTTI I PUNTOI BIKESTOP (per visualizzarli sulla mappa)
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

    if (status !== undefined) updateData.status = status;

    if (hazardType !== undefined) {
      updateData.hazardType = hazardType;

      if (stopToUpdate.category === "pericolo" && hazardType !== null) {
        updateData.name = `Pericolo: ${hazardType}`;
      }
    }

    const updatedStop = await BikeStop.findByIdAndUpdate(req.params.id, updateData, { returnDocument: "after" });

    res.json(updatedStop);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Errore nell'aggiornamento dello stato");
  }
};

// ELIMINA UN PUNTO
exports.deleteStop = async (req, res) => {
  try {
    const stop = await BikeStop.findById(req.params.id);
    if (!stop) return res.status(404).json({ msg: "Punto non trovato" });

    if (stop.author.toString() !== req.user.id) return res.status(401).json({ msg: "Non autorizzato" });

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

    console.log("Utente che commenta:", req.user);

    const newComment = {
      user: req.user.id,
      userName: req.user.username || req.user.email || "Ciclista Anonimo",
      text: text,
    };

    stop.comments.unshift(newComment);
    await stop.save();

    res.json(stop.comments);
  } catch (err) {
    console.error("ERRORE AGGIUNTA COMMENTO:", err.message);
    res.status(500).json({ error: err.message });
  }
};
