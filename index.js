
const http = require("http");

const SID = "0421";

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  res.setHeader("Cache-Control", "no-store");

  // Accueil
  if (url.pathname === "/") {
    res.writeHead(200, {
      "Content-Type": "text/plain"
    });
    return res.end("online");
  }

  // Vérification du SID
  if (req.headers.sid !== SID) {
    res.writeHead(403);
    return res.end("Invalid SID");
  }

  // Requête POST
  if (req.method === "POST" &&
      url.pathname === "/typewriter/read") {

    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      let input = "";

      try {
        const data = JSON.parse(body);
        input = data.value || "";
      } catch {
        const params = new URLSearchParams(body);
        input = params.get("value") || "";
      }

      console.log("Signal reçu :", input);

      // Réponse de test du wiki
      res.writeHead(200, {
        "Content-Type": "text/plain"
      });

      res.end("10110203");
    });

    return;
  }

  // GET automatique
  if (req.method === "GET" &&
      url.pathname === "/typewriter/read") {

    res.writeHead(200, {
      "Content-Type": "text/plain"
    });

    return res.end("10110203");
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(process.env.PORT || 3000, () => {
  console.log("API online");
});
