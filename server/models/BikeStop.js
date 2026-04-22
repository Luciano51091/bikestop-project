const mongoose = require("mongoose");

const bikeStopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ["officina", "fontanella", "ricarica-ebike", "hotel", "bar"],
    required: true,
  },
  // Formato GeoJSON: fondamentale per la mappa
  location: {
    type: {
      type: String,
      enum: ["Point"], // Deve essere 'Point'
      default: "Point",
    },
    coordinates: {
      type: [Number], // [Longitudine, Latitudine] -> Attento: Longitudine va sempre per prima!
      required: true,
    },
  },
  services: [String], // es: ["pompa", "wi-fi"]
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

// Creiamo un indice geospaziale per permettere a MongoDB di fare calcoli di distanza
bikeStopSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("BikeStop", bikeStopSchema);
