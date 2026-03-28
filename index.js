// index.js
const express = require("express");
const fetch = require("node-fetch");
const https = require("https");

const app = express();
app.use(express.json());

// Rayna API base
const BASE_URL = "https://activities.raynatours.com/api";

// Keep-Alive агент для HTTPS
const agent = new https.Agent({ keepAlive: true, rejectUnauthorized: false });

// --------------------
// CORS Middleware
// --------------------
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS,GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// --------------------
// Ping Endpoint
// --------------------
app.get("/api/ping", (req, res) => {
  res.send({ status: "alive" });
});

// --------------------
// Proxy Endpoint
// --------------------
app.all("/api/*", async (req, res) => {
  try {
    const path = req.params[0]; // всё после /api/
    const targetUrl = `${BASE_URL}/${path}`;

    // Минимальный логинг
    console.log(`[Proxy] ${req.method} -> ${targetUrl}`);
    console.log(`[Proxy] Body keys:`, req.body ? Object.keys(req.body) : "none");

    // Форвардим запрос к Rayna API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZGFiNTFjMC00NjViLTQzMTYtYWRjZS05N2I0NmUyNzNiMzciLCJVc2VySWQiOiI1MDk0MCIsIlVzZXJUeXBlIjoiQWdlbnQiLCJQYXJlbnRJRCI6IjAiLCJFbWFpbElEIjoicGFydG5lcnNAc29sdmVyLmFlIiwiaXNzIjoiaHR0cDovL3JheW5hd2ViYXBpYXdzLnJheW5hdG91cnMuY29tIiwiYXVkIjoiaHR0cDovL3JheW5hd2ViYXBpYXdzLnJheW5hdG91cnMuY29tIn0.opumyPHSwaV3PrV1LnFJdccz9qcMqicEUsQWUAWbvWo"
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
      agent
    });

    const data = await response.text();

    // Отправляем ответ Bubble / клиенту
    res.status(response.status).send(data);

  } catch (err) {
    console.error("[Proxy Error]:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
