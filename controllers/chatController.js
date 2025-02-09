// controllers/chatController.js
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { OpenAI } = require("openai");
const ChatSession = require("../models/ChatSession");
const User = require("../models/User");

const deepseekClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const getChatHistory = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const userId = decoded.userId;

    const chatSession = await ChatSession.findOne({ userId });
    if (!chatSession) {
      return res.json({ messages: [] });
    }

    res.json({ messages: chatSession.messages });
  } catch (error) {
    console.error("History Error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

const chatWithBot = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const userId = decoded.userId;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    let chatSession =
      (await ChatSession.findOne({ userId })) ||
      new ChatSession({ userId, messages: [] });

    // Save user message
    chatSession.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Build user context
    const allUsers = await User.find({}).select(
      "username businessName location interests expertise tier points"
    );
    const userContext = allUsers
      .map((u) => {
        const fields = [];
        if (u.username) fields.push(`username: ${u.username}`);
        if (u.businessName) fields.push(`businessName: ${u.businessName}`);
        if (u.location) fields.push(`location: ${u.location}`);
        if (u.interests) fields.push(`interests: ${u.interests}`);
        if (u.expertise) fields.push(`expertise: ${u.expertise}`);
        if (u.points) fields.push(`points: ${u.points}`);
        if (u.tier) fields.push(`tier: ${u.tier}`);
        return fields.join(", ");
      })
      .join("\n");

    // Build chatHistory
    const conversation = chatSession.messages
      .map((m) => (m.role === "user" ? `User: ${m.content}` : `Bot: ${m.content}`))
      .join("\n");

    const prompt = `
We have a list of users in our system:
${userContext}

Conversation so far:
${conversation}

Respond to the user's query.
    `.trim();

    // Call model
    const completion = await deepseekClient.chat.completions.create({
      model: "deepseek/deepseek-r1-distill-llama-8b",
      messages: [{ role: "user", content: prompt }],
    });

    const botResponse = completion.choices[0].message.content;

    // Save bot response
    chatSession.messages.push({
      role: "assistant",
      content: botResponse,
      timestamp: new Date(),
    });
    await chatSession.save();

    res.json({ response: botResponse });
  } catch (error) {
    console.error("Chatbot Error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getChatHistory, chatWithBot };
