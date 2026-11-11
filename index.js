
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const SID = process.env.SID || "0421";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const queues = new Map();

function getSid(req) {
  return String(
    req.get("sid") ||
    req.query.sid ||
    req.body?.sid ||
    SID
  );
}

function getQueue(sid) {
  if (!queues.has(sid)) queues.set(sid, []);
  return queues.get(sid);
}

function checkSid(req) {
  return getSid(req) === SID;
}

app.get("/", (req, res) => {
  res.type("html").send(`
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Build Logic Typewriter</title>
<style>
body {
  background: #10131b;
  color: white;
  font-family: Arial;
  padding: 25px;
}
main {
  max-width: 440px;
  margin: auto;
  background: #191f2c;
  padding: 20px;
  border-radius: 15px;
}
textarea {
  width: 100%;
  height: 130px;
  box-sizing: border-box;
  padding: 12px;
}
button {
  width: 100%;
  padding: 14px;
  margin-top: 12px;
  background: #6c8cff;
  border: 0;
  border-radius: 8px;
}
</style>
</head>
<body>
<main>
<h2>Build Logic Typewriter</h2>
<textarea id="message" placeholder="Écris ton message..."></textarea>
<button onclick="sendMessage()">Envoyer</button>
<p id="status"></p>
</main>
<script>
async function sendMessage() {
  const message = document.getElementById("message").value;
  const status = document.getElementById("status");

  if (!message.trim()) {
    status.textContent = "Écris un message.";
    return;
  }

  try {
    const response = await fetch("/typewriter/send", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({message, sid: "0421"})
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error);

    status.textContent = data.message;
  } catch (error) {
    status.textContent = "Erreur : " + error.message;
  }
}
</script>
</body>
</html>
  `);
});

app.post("/typewriter/send", (req, res) => {
  const sid = getSid(req);
  const message = req.body?.message;

  if (sid !== SID) {
    return res.status(403).json({error: "SID incorrect"});
  }

  if (typeof message !== "string" || !message.length) {
    return res.status(400).json({error: "Message manquant"});
  }

  if (message.length > 200) {
    return res.status(400).json({error: "Message trop long"});
  }

  const bytes = Buffer.from(message, "utf8");
  const queue = getQueue(sid);

  queue.push(...bytes);

  res.json({
    ok: true,
    message: "Message envoyé !",
    bytesAdded: bytes.length,
    bytesWaiting: queue.length
  });
});

function readNext(req, res) {
  const sid = getSid(req);

  if (!checkSid(req)) {
    return res.status(403).json({error: "SID incorrect"});
  }

  const queue = getQueue(sid);
  const byte = queue.length ? queue.shift() : 0;
  const binary = byte.toString(2).padStart(8, "0");

  res.set("Cache-Control", "no-store");
  res.json({value: binary});
}

app.get("/typewriter/read", readNext);
app.post("/typewriter/read", readNext);

app.get("/health", (req, res) => {
  res.json({online: true});
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Typewriter lancé sur le port " + PORT);
});
