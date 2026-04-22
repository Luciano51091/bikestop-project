const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const bikeStopRoutes = require("./routes/bikeStopRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/bikestops", bikeStopRoutes);

// Connessione DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connesso con successo! ✅"))
  .catch((err) => console.log("Errore connessione DB: ❌", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server attivo sulla porta ${PORT} 🚀`));
