require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

// Gemini API setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/sort-notes', async (req, res) => {
    const { messyText } = req.body;

    if (!messyText) {
        return res.status(400).json({ error: 'Please provide messyText in the request body.' });
    }

    try {
        // Model initialize karein (Gemini 1.5 Flash MVP ke liye fast aur sasta hai)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Prompt engineering: Model ko clear instruction dena ki hume kya chahiye
        const prompt = `
        You are a highly efficient assistant. I will give you a messy, unstructured brain-dump or meeting notes. 
        Your task is to analyze it and return a structured JSON response with two keys:
        1. "summary": A 2-sentence summary of the overall text.
        2. "action_items": An array of specific tasks or next steps mentioned or implied in the text.
        
        Do not include markdown blocks like \`\`\`json. Return strictly the raw JSON object.
        
        Here are the messy notes:
        "${messyText}"
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let aiText = response.text().trim();
        
        // JSON parsing
        const structuredData = JSON.parse(aiText);

        res.status(200).json({
            success: true,
            data: structuredData
        });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: 'Failed to process notes.' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`SortMyNotes AI MVP running on http://localhost:${PORT}`);
});