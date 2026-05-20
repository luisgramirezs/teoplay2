require('dotenv').config();

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/chat', async (req, res) => {
    try {

        const completion = await client.chat.completions.create(req.body);

        res.json(completion);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message,
        });
    }
});

app.post('/api/image', async (req, res) => {
    try {

        const image = await client.images.generate(req.body);

        res.json(image);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message,
        });
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});