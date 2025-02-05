const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");

const port = process.env.PORT || 4000;

const DB = process.env.DATABASE;

const mongoose = require("mongoose");
mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.log("DB connection error:", err));

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
