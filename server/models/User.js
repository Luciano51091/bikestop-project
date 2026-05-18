const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return !this.isGoogleUser;
    },
  },

  isGoogleUser: {
    type: Boolean,
    default: false,
  },

  role: {
    type: String,
    enum: ["user", "business"],
    default: "user",
  },
  createdAt: { type: Date, default: Date.now },

  profileImage: {
    type: String,
    default: "",
  },

  stats: {
    stopsCreated: { type: Number, default: 0 },
    totalVerifications: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
  },

  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BikeStop",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
