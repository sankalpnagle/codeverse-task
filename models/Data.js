const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

const getDataModel = (tenantConn) => {
  return tenantConn.models.Data || tenantConn.model("Data", DataSchema);
};

module.exports = { getDataModel };
