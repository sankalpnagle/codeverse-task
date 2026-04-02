const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const MasterUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    masterId: { type: String, required: true },
  },
  { timestamps: true },
);

MasterUserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

MasterUserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

const getMasterUserModel = (tenantConn) => {
  return (
    tenantConn.models.MasterUser ||
    tenantConn.model("MasterUser", MasterUserSchema)
  );
};

module.exports = { getMasterUserModel };
