const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;
app.use(cors());
app.use(express.json());

const lconskWhRoutes = require("./routes/lcons");
const lconskVAhRoutes = require("./routes/lcons");
app.use("/api", lconskWhRoutes);
app.use("/api", lconskVAhRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
