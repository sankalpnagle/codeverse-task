const Master = require("../models/Master");
const { getMasterUserModel } = require("../models/MasterUser");
const { getTenantConnection } = require("../config/tenantDb");
const jwt = require("jsonwebtoken");

exports.loginMasterUser = async (req, res) => {
  try {
    const { email, password, tenantId } = req.body;
    if (!email || !password || !tenantId)
      return res.status(400).json({ success: false, message: "email, password and tenantId are required" });

    const master = await Master.findOne({ tenantId });
    if (!master)
      return res.status(404).json({ success: false, message: "Tenant not found" });

    const conn = await getTenantConnection(tenantId);
    const MasterUser = getMasterUserModel(conn);

    const user = await MasterUser.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: "masteruser", tenantId }, process.env.JWT_SECRET_KEY, { expiresIn: "8h" });
    res.status(200).json({ success: true, token, data: { id: user._id, name: user.name, email: user.email, tenantId } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const { tenantId, id } = req.user;
    const conn = await getTenantConnection(tenantId);
    const MasterUser = getMasterUserModel(conn);
    const user = await MasterUser.findById(id, "-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
