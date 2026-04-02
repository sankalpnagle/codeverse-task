const mongoose = require("mongoose");

const tenantConnections = {};

const getTenantConnection = async (tenantId) => {
  if (!tenantId) throw new Error("tenantId is required");

  if (tenantConnections[tenantId]) {
    return tenantConnections[tenantId];
  }

  const uri = `${process.env.MONGO_URI_BASE}/tenant_${tenantId}`;
  const conn = await mongoose.createConnection(uri).asPromise();
  tenantConnections[tenantId] = conn;
  return conn;
};

module.exports = { getTenantConnection };
