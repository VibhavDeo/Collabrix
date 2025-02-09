const express = require("express");
const { chatWithBot, getChatHistory } = require("../controllers/chatController");
const router = express.Router();

// Get chat history for authenticated user
router.get("/history", getChatHistory);

// Handle chatbot messages
router.post("/", chatWithBot);

module.exports = router;
