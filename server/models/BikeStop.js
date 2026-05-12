const mongoose = require("mongoose");

const bikeStopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    category: {
      type: String,
      enum: ["officina", "fontanella", "ricarica-ebike", "alloggio", "bar", "pericolo"],
      required: true,
    },

    services: {
      hasWater: { type: Boolean, default: false },
      hasTools: { type: Boolean, default: false },
      hasCharging: { type: Boolean, default: false },

      hasSecureParking: { type: Boolean, default: false },
      hasPump: { type: Boolean, default: false },
      hasShelter: { type: Boolean, default: false },
      isBikeFriendly: { type: Boolean, default: true },
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

    imageUrl: { type: String, default: "" },

    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        userName: String,
        text: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],

    verifiedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    ratings: {
      works: { type: Number, default: 0 },
      notWorks: { type: Number, default: 0 },
      starSum: { type: Number, default: 0 },
      starCount: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      ratedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },

    hazardVerifications: {
      stillThere: { type: Number, default: 0 },
      resolved: { type: Number, default: 0 },
    },

    lastVerified: { type: Date, default: Date.now },
    verifications: { type: Number, default: 0 },
  },
  { timestamps: true },
);

bikeStopSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("BikeStop", bikeStopSchema);
