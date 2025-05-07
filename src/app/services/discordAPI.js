import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const headers = {
  Authorization: process.env.DISCORD_TOKEN,
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.91 Chrome/130.0.6723.191 Electron/33.4.0 Safari/537.36",
  "X-Discord-Locale": "en-US",
  "X-Discord-Timezone": "Asia/Jakarta",
};
const tx = async (content) => {
  try {
    const response = await axios.get(
      `https://discord.com/api/v9/guilds/${process.env.GUILD_ID}/messages/search`,
      {
        params: {
          channel_id: process.env.CHANNEL_ID,
          content,
        },
        headers: headers,
      }
    );

    return response.data; // Flatten nested array of messages
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err.message);
    return null;
  }
};

export default tx;
