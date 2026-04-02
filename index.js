const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectSuperAdminDB = require("./config/superAdminDb");

const superAdminRoutes = require("./routes/superAdminRoutes");
const masterRoutes = require("./routes/masterRoutes");
const authRoutes = require("./routes/authRoutes");
const masterUserRoutes = require("./routes/masterUserRoutes");
const dataRoutes = require("./routes/dataRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Multi-Tenant API is running" });
});

app.use("/superadmin", superAdminRoutes);
app.use("/master", masterRoutes);
app.use("/auth", authRoutes);
app.use("/master/user", masterUserRoutes);
app.use("/data", dataRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error", error: err.message });
});

const PORT = process.env.PORT || 8000;

const start = async () => {
  await connectSuperAdminDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
