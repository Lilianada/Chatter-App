//server.js

const express = require ("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const connectDb = require("./config/db.js");
const fileupload = require("express-fileupload");
const path = require("path");

const PORT = process.env.PORT || 5050;
connectDb();
const app = express();

const articles = require("./routes/articlesRoute.js");
const errorHandler = require("./middleware/error.js");

app.use(cors());
app.use(express.json());
app.use(errorHandler);  

//File uploading
app.use(fileupload());

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Mount routers
app.use("/api/articles", articles);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});