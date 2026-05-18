const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", auth, authController.getMe);
router.put("/update", auth, authController.updateProfile);
router.post("/favorite/:stopId", auth, authController.toggleFavorite);
router.post("/google", authController.googleLogin);

module.exports = router;
