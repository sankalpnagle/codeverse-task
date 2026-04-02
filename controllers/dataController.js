const { getDataModel } = require("../models/Data");
const { getTenantConnection } = require("../config/tenantDb");

const resolveDataModel = async (req) => {
  const tenantId = req.user.role === "masteruser" ? req.user.tenantId : "public";
  const conn = await getTenantConnection(tenantId);
  return getDataModel(conn);
};

exports.createData = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content)
      return res.status(400).json({ success: false, message: "title and content are required" });

    const DataModel = await resolveDataModel(req);
    const record = new DataModel({ title, content, userId: req.user.id });
    await record.save();
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getAllData = async (req, res) => {
  try {
    const DataModel = await resolveDataModel(req);
    const records = await DataModel.find({ userId: req.user.id });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getDataById = async (req, res) => {
  try {
    const DataModel = await resolveDataModel(req);
    const record = await DataModel.findOne({ _id: req.params.id, userId: req.user.id });
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.updateData = async (req, res) => {
  try {
    const DataModel = await resolveDataModel(req);
    const { title, content } = req.body;
    const record = await DataModel.findOne({ _id: req.params.id, userId: req.user.id });
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });

    if (title) record.title = title;
    if (content) record.content = content;
    await record.save();
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.deleteData = async (req, res) => {
  try {
    const DataModel = await resolveDataModel(req);
    const record = await DataModel.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });
    res.status(200).json({ success: true, message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
