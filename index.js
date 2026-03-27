const express = require("express");
const fetch = require("node-fetch");
const https = require("https");

const app = express();
app.use(express.json());

const BASE_URL = "https://activities.raynatours.com/api/Tour";
const agent = new https.Agent({ rejectUnauthorized: false });

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.post("/api/*", async (req, res) => {
  try {
    const path = req.params[0];
    const targetUrl = `${BASE_URL}/${path}`;

    console.log("Forwarding to:", targetUrl);
    console.log("Body:", req.body);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZGFiNTFjMC00NjViLTQzMTYtYWRjZS05N2I0NmUyNzNiMzciLCJVc2VySWQiOiI1MDk0MCIsIlVzZXJUeXBlIjoiQWdlbnQiLCJQYXJlbnRJRCI6IjAiLCJFbWFpbElEIjoicGFydG5lcnNAc29sdmVyLmFlIiwiaXNzIjoiaHR0cDovL3JheW5hd2ViYXBpYXdzLnJheW5hdG91cnMuY29tIiwiYXVkIjoiaHR0cDovL3JheW5hd2ViYXBpYXdzLnJheW5hdG91cnMuY29tIn0.opumyPHSwaV3PrV1LnFJdccz9qcMqicEUsQWUAWbvWo"
      },
      body: JSON.stringify(req.body),
      agent
    });

    const data = await response.text();
    console.log("Response status:", response.status);
    console.log("Response body:", data);

    res.status(response.status).send(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
