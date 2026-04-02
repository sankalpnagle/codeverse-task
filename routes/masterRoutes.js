const express = require("express");
const { loginMaster, createUser, getUsers } = require("../controllers/masterController");
const { requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginMaster);
router.post("/user", requireRole("master"), createUser);
router.get("/users", requireRole("master"), getUsers);

module.exports = router;
