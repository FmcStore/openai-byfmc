import axios from "axios";
import * as cheerio from "cheerio";
import { v4 as uuidv4 } from "uuid";

const MODEL_IDS = {
  "gpt-4o-mini": "25865",
  "gpt-5-nano": "25871",
  "gemini": "25874",
  "deepseek": "25873",
  "claude": "25875",
  "grok": "25872",
  "meta-ai": "25870",
  "qwen": "25869"
};

async function scrapeChat(question, model = "gpt-5-nano", sessionId = uuidv4()) {
  if (!MODEL_IDS[model]) throw new Error("Invalid model");

  // scrape langsung dari website
  const { data: html } = await axios.get("https://chatgptfree.ai/", {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36",
    },
  });

  const $ = cheerio.load(html);
  const match = $.html().match(/"nonce":"([^"]+)"/);
  if (!match) throw new Error("Nonce not found.");
  const nonce = match[1];

  const { data } = await axios.post(
    "https://chatgptfree.ai/wp-admin/admin-ajax.php",
    new URLSearchParams({
      action: "aipkit_frontend_chat_message",
      _ajax_nonce: nonce,
      bot_id: MODEL_IDS[model],
      session_id: sessionId,
      conversation_uuid: sessionId,
      post_id: "6",
      message: question,
    }).toString(),
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        origin: "https://chatgptfree.ai",
        referer: "https://chatgptfree.ai/",
      },
    }
  );

  return data?.result?.content?.data?.reply || "⚠️ Tidak ada respon.";
}

export async function POST(req) {
  try {
    const { message, model, session } = await req.json();
    const reply = await scrapeChat(message, model, session);
    return Response.json({ success: true, reply });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}
