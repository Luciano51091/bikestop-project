const mongoose = require("mongoose");

const bikeStopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ["officine", "fontanelle", "ricarica-ebike", "hotel", "bar"],
    required: true,
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  services: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

bikeStopSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("BikeStop", bikeStopSchema);
