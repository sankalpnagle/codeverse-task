const express = require("express");
const { createData, getAllData, getDataById, updateData, deleteData } = require("../controllers/dataController");
const { requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Accessible to both public users and master-users
const dataAuth = requireRole("user", "masteruser");

router.post("/", dataAuth, createData);
router.get("/", dataAuth, getAllData);
router.get("/:id", dataAuth, getDataById);
router.put("/:id", dataAuth, updateData);
router.delete("/:id", dataAuth, deleteData);

module.exports = router;
