const mongoose = require("mongoose");

const bikeStopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ["officina", "fontanella", "ricarica-ebike", "hotel", "bar", "pericolo"],
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

  status: {
    type: String,
    enum: ["active", "broken"],
    default: "active",
  },
  hazardType: {
    type: String,
    enum: ["buca", "vetri", "lavori", "strada-chiusa", "altro"],
    default: null,
  },
  lastVerified: { type: Date, default: Date.now },
  imageUrl: { type: String, default: "" },
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      userName: String,
      text: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
});

bikeStopSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("BikeStop", bikeStopSchema);
