const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const MasterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    tenantId: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

MasterSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

MasterSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("Master", MasterSchema);
