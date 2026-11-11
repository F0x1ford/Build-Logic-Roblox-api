
const http = require("http");

const SID = "0421";
let value = "Bonjour";

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const url = new URL(req.url, "http://localhost");

  // Page d'accueil
  if (url.pathname === "/") {
    res.writeHead(200);
    return res.end(JSON.stringify({
      status: "online"
    }));
  }

  // Vérification du SID envoyé dans les headers
  if (req.headers.sid !== SID) {
    res.writeHead(403);
    return res.end(JSON.stringify({
      error: "Invalid SID"
    }));
  }

  // Données destinées à Build Logic
  if (req.method === "GET" &&
      url.pathname === "/typewriter/read") {
    res.writeHead(200);
    return res.end(JSON.stringify({
      value: value
    }));
  }

  res.writeHead(404);
  res.end(JSON.stringify({
    error: "Not found"
  }));
});

server.listen(process.env.PORT || 3000, () => {
  console.log("API online");
});
