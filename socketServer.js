require("dotenv").config();
const { OpenAI } = require("openai");
const jwt = require("jsonwebtoken");
const ChatSession = require("./models/ChatSession");
const User = require("./models/User");

const deepseekClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// Track online users
let users = [];

/**
 * Socket authentication middleware
 */
const authSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error: No token"));

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    socket.decoded = decoded;
    return next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
};

/**
 * Socket server logic
 */
const socketServer = (socket) => {
  const userId = socket.decoded.userId;
  console.log(`Socket connected: userId=${userId}, socketId=${socket.id}`);

  // Track online users
  users.push({ userId, socketId: socket.id });

  /**
   * Peer-to-Peer Messaging
   */
  socket.on("send-message", (recipientUserId, username, content) => {
    console.log(`Message from ${userId} to ${recipientUserId}: ${content}`);

    const recipient = users.find((user) => user.userId == recipientUserId);
    if (recipient) {
      socket.to(recipient.socketId).emit("receive-message", userId, username, content);
    } else {
      socket.emit("message-error", "Recipient not online");
    }
  });

  /**
   * Get Chat History
   */
  socket.on("get-chat-history", async () => {
    console.log("Received get-chat-history event from userId:", userId);
    try {
      let chatSession = await ChatSession.findOne({ userId });
      socket.emit("chat-history", chatSession ? chatSession.messages : []);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      socket.emit("chat-history-error", "Could not fetch chat history.");
    }
  });

  /**
   * Chatbot Messaging
   */
  socket.on("chatbot-message", async (data) => {
    console.log("Received chatbot-message:", data, "from userId:", userId);
    try {
      // Fetch or create chat session
      let chatSession = await ChatSession.findOne({ userId }) ||
        new ChatSession({ userId, messages: [] });

      // Save user message
      chatSession.messages.push({
        role: "user",
        content: data.message,
        timestamp: new Date(),
      });
      await chatSession.save();

      // Fetch user context
      const allUsers = await User.find({}).select("username businessName location interests expertise tier points");
      const userContext = allUsers.map(u => {
        const fields = [];
        if (u.username) fields.push(`username: ${u.username}`);
        if (u.businessName) fields.push(`businessName: ${u.businessName}`);
        if (u.location) fields.push(`location: ${u.location}`);
        if (u.interests) fields.push(`interests: ${u.interests}`);
        if (u.expertise) fields.push(`expertise: ${u.expertise}`);
        if (u.points) fields.push(`points: ${u.points}`);
        if (u.tier) fields.push(`tier: ${u.tier}`);
        return fields.join(", ");
      }).join("\n");

      // Build conversation history
      const conversation = chatSession.messages.map(m =>
        (m.role === "user" ? `User: ${m.content}` : `Bot: ${m.content}`)
      ).join("\n");

      // Prepare AI prompt
      const prompt = `
We have a list of users in our system, each with certain fields:
${userContext}

Conversation so far:
${conversation}

Important:
- Format your answer in **Markdown**.
- Use bullet points, bold text, headings, etc. if helpful.
- Provide a suggested user link like http://localhost:3000/users/{username} if relevant.

      `.trim();

      console.log("Calling OpenAI with prompt length:", prompt.length);

      // Call the AI model
      const completion = await deepseekClient.chat.completions.create({
        model: "deepseek/deepseek-r1-distill-qwen-32b",
        messages: [{ role: "user", content: prompt }],
      });

      const botResponse = completion.choices[0].message.content;
      console.log("AI Response:", botResponse);

      // Save bot response
      chatSession.messages.push({
        role: "assistant",
        content: botResponse,
        timestamp: new Date(),
      });
      await chatSession.save();

      // Emit AI response to user
      socket.emit("chatbot-response", { user: "assistant", message: botResponse });
    } catch (error) {
      console.error("Chatbot Error:", error);
      socket.emit("chatbot-error", error?.message || "Unknown chatbot error");
    }
  });

  /**
   * Handle Disconnection
   */
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: userId=${userId}, socketId=${socket.id}`);
    users = users.filter((user) => user.userId !== userId);
  });
};

module.exports = { socketServer, authSocket };
