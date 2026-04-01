const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Mon app fonctionne 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});