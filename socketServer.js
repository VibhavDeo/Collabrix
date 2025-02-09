require("dotenv").config();
const { OpenAI } = require("openai");
const jwt = require("jsonwebtoken");
const ChatSession = require("./models/ChatSession");
const Supplier = require("./models/Supplier");

const deepseekClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.DEEPSEEK_API_KEY,
});

let onlineUsers = [];

const authSocket = (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        socket.decoded = decoded;
        next();
    } catch (err) {
        next(new Error("Authentication error"));
    }
};

const socketServer = (socket) => {
    const userId = socket.decoded.userId;
    
    onlineUsers.push({ userId, socketId: socket.id });

    socket.on("send-message", (recipientUserId, username, content) => {
        const recipient = onlineUsers.find(user => user.userId == recipientUserId);
        recipient && socket.to(recipient.socketId)
            .emit("receive-message", userId, username, content);
    });

    socket.on("chatbot-message", async (data) => {
        try {
            let chatSession = await ChatSession.findOne({ userId }) || 
                new ChatSession({ userId, messages: [] });

            // Save user message immediately
            chatSession.messages.push({
                role: "user",
                content: data.message,
                timestamp: new Date()
            });

            const suppliers = await Supplier.find({});
            const supplierContext = suppliers.map(s => 
                `${s.name} in ${s.location} supplies: ${s.supplies.join(", ")}`
            ).join("\n");

            const chatHistory = chatSession.messages.map(m => 
                `${m.role === "user" ? "User" : "Bot"}: ${m.content}`
            ).join("\n");

            const prompt = `Chat History:\n${chatHistory}\n\nSupplier Knowledge:\n${supplierContext}\n\nUser: ${data.message}`;

            const completion = await deepseekClient.chat.completions.create({
                model: "deepseek/deepseek-r1-distill-llama-8b",
                messages: [{ role: "user", content: prompt }],
            });

            const botResponse = completion.choices[0].message.content;

            // Save bot response
            chatSession.messages.push({
                role: "assistant",
                content: botResponse,
                timestamp: new Date()
            });
            
            await chatSession.save();

            socket.emit("chatbot-response", { user: "bot", message: botResponse });

        } catch (error) {
            console.error("Chatbot Error:", error);
            socket.emit("chatbot-error");
        }
    });

    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter(user => user.userId !== userId);
    });
};

module.exports = { socketServer, authSocket };
