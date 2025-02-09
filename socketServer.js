// socketServer.js
require("dotenv").config();
const { OpenAI } = require("openai");
const jwt = require("jsonwebtoken");
const ChatSession = require("./models/ChatSession");
const User = require("./models/User"); // <-- now referencing user, not supplier

// Create OpenAI client
const deepseekClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// Track online users
let onlineUsers = [];

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

const socketServer = (socket) => {
  const userId = socket.decoded.userId;
  console.log(`Socket connected: userId=${userId}, socketId=${socket.id}`);

  onlineUsers.push({ userId, socketId: socket.id });

  /**
   * get-chat-history
   */
  socket.on("get-chat-history", async () => {
    console.log("Received get-chat-history event from userId:", userId);
    try {
      let chatSession = await ChatSession.findOne({ userId });
      if (!chatSession) {
        socket.emit("chat-history", []);
      } else {
        socket.emit("chat-history", chatSession.messages);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      socket.emit("chat-history-error", "Could not fetch chat history.");
    }
  });

  /**
   * chatbot-message
   */
  socket.on("chatbot-message", async (data) => {
    console.log("Received chatbot-message:", data, "from userId:", userId);
    try {
      // fetch or create chat session
      let chatSession =
        (await ChatSession.findOne({ userId })) ||
        new ChatSession({ userId, messages: [] });

      // save user message
      chatSession.messages.push({
        role: "user",
        content: data.message,
        timestamp: new Date(),
      });
      await chatSession.save();

      // build "user knowledge" from the database
      // omit personal data like email/password
      // only fetch the fields you want the AI to see
      const allUsers = await User.find({}).select(
        "username businessName location interests expertise tier points"
      );
      console.log("Fetched user count:", allUsers.length);

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

      // build chatHistory
      const conversation = chatSession.messages
        .map((m) => (m.role === "user" ? `User: ${m.content}` : `Bot: ${m.content}`))
        .join("\n");

      // This prompt instructs the model to incorporate user data if needed
      const prompt = `
We have a list of users in our system, each with certain fields:
${userContext}

Conversation so far:
${conversation}

Important:
- Format your answer in **Markdown**.
- Use bullet points, bold text, headings, etc. if helpful.
- No additional commentary outside your Markdown.

      `.trim();

      console.log("Calling OpenAI with prompt length:", prompt.length);

      // call the model
      const completion = await deepseekClient.chat.completions.create({
        model: "deepseek/deepseek-r1-distill-qwen-32b",
        messages: [{ role: "user", content: prompt }],
      });
      

      const botResponse = completion.choices[0].message.content;
      console.log(botResponse);

      // save bot response
      chatSession.messages.push({
        role: "assistant",
        content: botResponse,
        timestamp: new Date(),
      });
      await chatSession.save();

      // emit back to client
      socket.emit("chatbot-response", { user: "bot", message: botResponse });
    } catch (error) {
      console.error("Chatbot Error:", error);
      socket.emit("chatbot-error", error?.message || "Unknown chatbot error");
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: userId=${userId}, socketId=${socket.id}`);
    onlineUsers = onlineUsers.filter((u) => u.userId !== userId);
  });
};

module.exports = { socketServer, authSocket };
