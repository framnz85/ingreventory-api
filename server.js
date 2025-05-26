// Add this line at the top of your server.js file
const path = require("path");

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { readdirSync, existsSync, mkdirSync } = require("fs");
require("dotenv").config();

const app = express();

app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.raw({ limit: "50mb" }));
app.use(cors());

readdirSync("./routes").map((file) =>
  app.use("/" + process.env.API_ROUTES, require("./routes/" + file))
);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
