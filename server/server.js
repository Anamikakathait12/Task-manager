const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 5000;

const app = express();

// app.use(cors());
// for deployment----
app.use(cors());
app.use(express.json());

app.use("/api/tasks", require("./routes/tasks")); 
app.use("/api/auth", require("./routes/auth"));

app.get("/", (req, res) => {
  res.json({
    message: "API is running",
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
  })
  .catch((err) => console.log("DB connection error:", err));