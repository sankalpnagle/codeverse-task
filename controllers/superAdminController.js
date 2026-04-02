// Create SuperAdmin API
exports.createSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "name, email and password are required",
        });
    }

    const exists = await SuperAdmin.findOne({ email });
    if (exists) {
      return res
        .status(409)
        .json({
          success: false,
          message: "SuperAdmin with this email already exists",
        });
    }

    const superAdmin = new SuperAdmin({ name, email, password });
    await superAdmin.save();

    res.status(201).json({
      success: true,
      message: "SuperAdmin created successfully",
      data: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
const SuperAdmin = require("../models/SuperAdmin");
const Master = require("../models/Master");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

exports.loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });

    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin || !(await superAdmin.comparePassword(password)))
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: superAdmin._id, role: "superadmin" },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "8h" },
    );
    res
      .status(200)
      .json({
        success: true,
        token,
        data: {
          id: superAdmin._id,
          name: superAdmin.name,
          email: superAdmin.email,
        },
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.createMaster = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({
          success: false,
          message: "name, email and password are required",
        });

    const exists = await Master.findOne({ email });
    if (exists)
      return res
        .status(409)
        .json({
          success: false,
          message: "Master with this email already exists",
        });

    const tenantId = uuidv4().replace(/-/g, "").slice(0, 16);
    const master = new Master({ name, email, password, tenantId });
    await master.save();

    res
      .status(201)
      .json({
        success: true,
        message: "Master created successfully",
        data: {
          id: master._id,
          name: master.name,
          email: master.email,
          tenantId: master.tenantId,
        },
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getMasters = async (req, res) => {
  try {
    const masters = await Master.find({}, "-password");
    res.status(200).json({ success: true, data: masters });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
