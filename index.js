
const http = require("http");

const sessions = new Map();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  // Page pour envoyer un message
  if (req.method === "GET" &&
      url.pathname === "/typewriter/edit") {

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8"
    });

    return res.end(`
      <h1>Mon Typewriter</h1>
      <form method="POST" action="/typewriter/send">
        <p>Message :</p>
        <input name="message" maxlength="512"
          placeholder="Bonjour" required>
        <p>Session ID :</p>
        <input name="sid" maxlength="10"
          value="0421" required>
        <button type="submit">Send</button>
      </form>
    `);
  }

  // Ajouter un message à la session
  if (req.method === "POST" &&
      url.pathname === "/typewriter/send") {

    let body = "";

    req.on("data", chunk => body += chunk);

    req.on("end", () => {
      const params = new URLSearchParams(body);
      const message = params.get("message") || "";
      const sid = params.get("sid") || "";

      if (!sid || !message) {
        res.writeHead(400);
        return res.end("Missing message or SID");
      }

      const queue = Array.from(message).map(char =>
        char.charCodeAt(0).toString(2).padStart(8, "0")
      );

      sessions.set(sid, queue);

      res.writeHead(200, {
        "Content-Type": "text/plain"
      });

      res.end("Message sent!");
    });

    return;
  }

  // Build Logic récupère un caractère
  if (req.method === "GET" &&
      url.pathname === "/typewriter/read") {

    const sid = req.headers.sid;

    if (!sid) {
      res.writeHead(400);
      return res.end(JSON.stringify({
        error: "Missing SID"
      }));
    }

    const queue = sessions.get(sid) || [];

    const binary = queue.length > 0
      ? queue.shift()
      : "00000000";

    sessions.set(sid, queue);

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    });

    return res.end(JSON.stringify({
      value: binary
    }));
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(process.env.PORT || 3000);
