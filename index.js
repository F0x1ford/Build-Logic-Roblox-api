
const http = require("http");

const SID = "0421";
const MESSAGE = "i love gubbys";

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  res.setHeader("Cache-Control", "no-store");

  // Page d'accueil
  if (url.pathname === "/") {
    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    return res.end(JSON.stringify({
      status: "online"
    }));
  }

  // Vérification du Session ID
  if (req.headers.sid !== SID) {
    res.writeHead(403, {
      "Content-Type": "application/json"
    });

    return res.end(JSON.stringify({
      error: "Invalid SID"
    }));
  }

  // Réponse destinée à Build Logic
  if (req.method === "GET" &&
      url.pathname === "/typewriter/read") {

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    return res.end(JSON.stringify({
      value: MESSAGE
    }));
  }

  // Route inconnue
  res.writeHead(404, {
    "Content-Type": "application/json"
  });

  res.end(JSON.stringify({
    error: "Not found"
  }));
});

server.listen(process.env.PORT || 3000, () => {
  console.log("API online");
});
