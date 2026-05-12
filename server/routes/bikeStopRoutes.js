const express = require("express");
const router = express.Router();
const bikeStopController = require("../controllers/bikeStopController");
const auth = require("../middleware/auth");

router.get("/user/mystops", auth, bikeStopController.getUserStops);
router.get("/", bikeStopController.getAllStops);
router.post("/", auth, bikeStopController.createStop);
router.patch("/:id/status", auth, bikeStopController.updateStatus);
router.delete("/:id", auth, bikeStopController.deleteStop);
router.post("/:id/comment", auth, bikeStopController.addComment);
router.patch("/:id/verify", auth, bikeStopController.rating);
router.post("/rate/:id", auth, bikeStopController.rateStop);

module.exports = router;
