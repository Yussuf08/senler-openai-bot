require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.post('/webhook', async (req, res) => {
  const message = req.body.message?.text;
  const sender_id = req.body.message?.user_id;

  if (message && sender_id) {
    try {
      const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });

      const reply = openaiResponse.data.choices[0].message.content;

      await axios.post(`https://api.senler.ru/v2/messages.send`, {
        group_id: process.env.GROUP_ID,
        user_id: sender_id,
        message: reply
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.SENLER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      res.sendStatus(200);
    } catch (error) {
      console.error("Error:", error?.response?.data || error.message);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(400);
  }
});

app.get('/', (req, res) => res.send('Senler-OpenAI Bot is working!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
