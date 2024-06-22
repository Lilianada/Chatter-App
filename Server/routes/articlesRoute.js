const express = require("express");
const { getAllArticles, getSingleArticle, createArticle, updateArticle, deleteArticle } = require("../controllers/articlesController");
const router = express.Router();

router.get("/", getAllArticles);
router.get("/:id", getSingleArticle);
router.post("/addArticle", createArticle);
router.put("/article/:id", updateArticle);
router.delete("article/:id", deleteArticle);

module.exports = router;