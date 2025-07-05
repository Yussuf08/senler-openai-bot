require('dotenv').config();
const axios = require('axios');
const express = require('express');
const app = express();
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SENLER_API_KEY = process.env.SENLER_API_KEY;
const GROUP_ID = process.env.GROUP_ID;

app.post('/webhook', async (req, res) => {
    const message = req.body.message.text;
    const userId = req.body.message.from_id;

    if (!message || !userId) return res.sendStatus(400);

    try {
        const gptResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const reply = gptResponse.data.choices[0].message.content;

        await axios.post(`https://api.senler.ru/messages.send`, {
            user_id: userId,
            group_id: GROUP_ID,
            message: reply
        }, {
            headers: {
                'Authorization': `Bearer ${SENLER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.sendStatus(200);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.sendStatus(500);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Bot is running on port ${PORT}`));
