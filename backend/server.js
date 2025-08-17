const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/user", (req, res) => {
  res.json({ message: "This is the backend" });
});

app.listen(PORT, () => {
  console.log("Connected to the backend server successfully");
});
