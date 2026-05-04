const express = require("express");
const router = express.Router();
const bikeStopController = require("../controllers/bikeStopController");
const auth = require("../middleware/auth");

router.get("/", bikeStopController.getAllStops);
router.post("/", auth, bikeStopController.createStop);
router.patch("/:id/status", auth, bikeStopController.updateStatus);
router.delete("/:id", auth, bikeStopController.deleteStop);
router.post("/:id/comment", auth, bikeStopController.addComment);

module.exports = router;
