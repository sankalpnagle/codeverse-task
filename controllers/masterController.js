const Master = require("../models/Master");
const { getMasterUserModel } = require("../models/MasterUser");
const { getTenantConnection } = require("../config/tenantDb");
const jwt = require("jsonwebtoken");

exports.loginMaster = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const master = await Master.findOne({ email });
    if (!master || !(await master.comparePassword(password)))
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: master._id, role: "master", tenantId: master.tenantId }, process.env.JWT_SECRET_KEY, { expiresIn: "8h" });
    res.status(200).json({ success: true, token, data: { id: master._id, name: master.name, email: master.email, tenantId: master.tenantId } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "name, email and password are required" });

    const { tenantId, id: masterId } = req.user;
    const conn = await getTenantConnection(tenantId);
    const MasterUser = getMasterUserModel(conn);

    const exists = await MasterUser.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, message: "User with this email already exists in this tenant" });

    const user = new MasterUser({ name, email, password, masterId });
    await user.save();

    res.status(201).json({ success: true, message: "User created successfully", data: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const conn = await getTenantConnection(tenantId);
    const MasterUser = getMasterUserModel(conn);
    const users = await MasterUser.find({}, "-password");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
