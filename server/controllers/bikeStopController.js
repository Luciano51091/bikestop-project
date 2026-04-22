const BikeStop = require("../models/BikeStop");

// AGGIUNGE UN NUOVO BIKESTOP
exports.createStop = async (req, res) => {
  try {
    const { name, description, category, longitude, latitude, services } = req.body;

    const newStop = new BikeStop({
      name,
      description,
      category,
      location: {
        type: "Point",
        coordinates: [longitude, latitude], // Longitudine prima!
      },
      services,
      author: req.user.id, // Lo prenderemo dal token JWT
    });

    const savedStop = await newStop.save();
    res.status(201).json(savedStop);
  } catch (err) {
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
