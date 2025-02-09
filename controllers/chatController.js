require("dotenv").config();
const jwt = require("jsonwebtoken");
const { OpenAI } = require("openai");
const Supplier = require("../models/Supplier");
const ChatSession = require("../models/ChatSession");

const deepseekClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.DEEPSEEK_API_KEY,
});

const getChatHistory = async (req, res) => {
    try {
        // Extract JWT from header
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

        res.json({ 
            messages: chatSession.messages
                .filter(msg => msg.role !== "system")
                .map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp
                }))
        });

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
        // Authentication
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const userId = decoded.userId;
        const { message } = req.body;

        if (!message) return res.status(400).json({ error: "Message is required" });

        let chatSession = await ChatSession.findOne({ userId }) || 
            new ChatSession({ userId, messages: [] });

        const suppliers = await Supplier.find({});
        const supplierContext = suppliers.map(s => 
            `${s.name} in ${s.location} supplies: ${s.supplies.join(", ")}`
        ).join("\n");

        const chatHistory = chatSession.messages.map(m => 
            `${m.role === "user" ? "User" : "Bot"}: ${m.content}`
        ).join("\n");

        const prompt = `Chat History:\n${chatHistory}\n\nSupplier Knowledge:\n${supplierContext}\n\nUser: ${message}`;

        const completion = await deepseekClient.chat.completions.create({
            model: "deepseek/deepseek-r1-distill-llama-8b",
            messages: [{ role: "user", content: prompt }],
        });

        const botResponse = completion.choices[0].message.content;

        chatSession.messages.push(
            { role: "user", content: message, timestamp: new Date() },
            { role: "assistant", content: botResponse, timestamp: new Date() }
        );
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

module.exports = { chatWithBot, getChatHistory };
