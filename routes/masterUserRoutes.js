const express = require("express");
const { loginMasterUser, profile } = require("../controllers/masterUserController");
const { requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginMasterUser);
router.get("/profile", requireRole("masteruser"), profile);

module.exports = router;
