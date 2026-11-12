
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.PASSWORD || "0421";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File d'attente des caractères
let queue = [];
let currentMessage = "";

// Vérification du mot de passe
function checkPassword(req, res, next) {
  const password = req.get("Password");

  if (password !== PASSWORD) {
    return res.status(401).json({
      error: "Mot de passe incorrect"
    });
  }

  next();
}

// Page web pour écrire un message
app.get("/", (req, res) => {
  res.send(`
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
  border-radius: 8px;
}
button {
  width: 100%;
  padding: 14px;
  margin-top: 12px;
  background: #6c8cff;
  color: white;
  border: 0;
  border-radius: 8px;
  font-size: 16px;
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
      body: JSON.stringify({message})
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error);

    status.textContent = "Message envoyé !";
  } catch (error) {
    status.textContent = "Erreur : " + error.message;
  }
}
</script>
</body>
</html>
  `);
});

// Le site envoie un message à l'API
app.post("/typewriter/send", (req, res) => {
  const message = req.body.message;

  if (typeof message !== "string" || !message.length) {
    return res.status(400).json({error: "Message vide"});
  }

  if (message.length > 200) {
    return res.status(400).json({error: "Message trop long"});
  }

  currentMessage = message;
  queue = Array.from(Buffer.from(message, "utf8"));

  res.json({
    ok: true,
    message: "Message ajouté à la file",
    characters: message.length
  });
});

// Build Logic récupère un octet binaire à chaque GET
app.get("/typewriter/read", checkPassword, (req, res) => {
  const byte = queue.length > 0 ? queue.shift() : 0;
  const binary = byte.toString(2).padStart(8, "0");

  res.set("Cache-Control", "no-store");
  res.json({value: binary});
});

// Vérifier que le serveur fonctionne
app.get("/health", (req, res) => {
  res.json({online: true});
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Build Logic Typewriter lancé sur le port " + PORT);
});
