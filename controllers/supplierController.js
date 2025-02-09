require("dotenv").config();
const Supplier = require("../models/Supplier");
const { OpenAI } = require("openai");

const deepseekClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1", // DeepSeek API endpoint
    apiKey: process.env.DEEPSEEK_API_KEY, // Store API key in .env
});

const getSupplierAnswer = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: "Query is required" });

        // Fetch all suppliers
        const suppliers = await Supplier.find({});
        if (suppliers.length === 0) {
            return res.status(404).json({ error: "No suppliers found" });
        }

        // Format context for AI
        const context = suppliers.map(s => 
            `${s.name} in ${s.location} supplies: ${s.supplies.join(", ")}`
        ).join("\n");

        // Create the prompt
        const prompt = `Answer the query using only the context below:\n${context}\n\nQuestion: ${query}`;

        // Call DeepSeek API
        const completion = await deepseekClient.chat.completions.create({
            model: "deepseek/deepseek-r1-distill-llama-8b",
            messages: [{ role: "user", content: prompt }]
        });

        res.json({ answer: completion.choices[0].message.content });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};
 
module.exports = { getSupplierAnswer };
