const express = require("express");
const router = express.Router();
const bikeStopController = require("../controllers/bikeStopController");
const auth = require("../middleware/auth");

router.get("/", bikeStopController.getAllStops);
router.post("/", auth, bikeStopController.createStop);

module.exports = router;
