const express = require("express");
const { getAllArticles, getSingleArticle, createArticle, updateArticle, deleteArticle } = require("../controllers/articlesController");
const router = express.Router();
const authenticate = require('../middleware/authenticate');

router.get("/", getAllArticles);
router.get("/:id", getSingleArticle);
router.post("/addArticle", authenticate, createArticle);
router.put("/article/:id", authenticate, updateArticle);
router.delete("article/:id", authenticate, deleteArticle);

module.exports = router;