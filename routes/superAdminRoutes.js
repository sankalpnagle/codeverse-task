const express = require("express");
const {
  loginSuperAdmin,
  createMaster,
  getMasters,
  createSuperAdmin,
} = require("../controllers/superAdminController");
const { requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", createSuperAdmin);
router.post("/login", loginSuperAdmin);
router.post("/master", requireRole("superadmin"), createMaster);
router.get("/masters", requireRole("superadmin"), getMasters);

module.exports = router;
