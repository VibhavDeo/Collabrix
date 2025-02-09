// routes/chat.js
const express = require("express");
const { chatWithBot, getChatHistory } = require("../controllers/chatController");
const router = express.Router();

router.get("/history", getChatHistory);
router.post("/", chatWithBot);

module.exports = router;
