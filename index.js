import functions from "firebase-functions";
import admin from "firebase-admin";
import fetch from "node-fetch";

admin.initializeApp();
const db = admin.firestore();

export const checkLink = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
    return;
  }

  try {
    const { url, userId } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!url) {
      res.status(400).json({ error: "Missing url" });
      return;
    }
    const apiKey = process.env.SAFE_BROWSING_API_KEY || "YOUR_API_KEY";
    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: "POST",
        body: JSON.stringify({
          client: { clientId: "CyberAwareAI", clientVersion: "1.0" },
          threatInfo: {
            threatTypes: [
              "MALWARE",
              "SOCIAL_ENGINEERING",
              "UNWANTED_SOFTWARE",
            ],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }],
          },
        }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    const isSafe = !data.matches;

    await db.collection("scans").add({
      url,
      safe: isSafe,
      checkedAt: new Date(),
      userId: userId || "guest",
    });

    res.json({
      safe: isSafe,
      message: isSafe
        ? "✅ This link is safe!"
        : "⚠️ Suspicious link detected — avoid clicking.",
    });
  } catch (error) {
    console.error("Error checking link:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


