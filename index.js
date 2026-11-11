
const http = require("http");

const SID = "0421";
let value = "Bonjour";

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const url = new URL(req.url, "http://localhost");

  if (req.headers["sid"] !== SID) {
    res.writeHead(403);
    return res.end(JSON.stringify({ error: "Invalid SID" }));
  }

  if (req.method === "GET" &&
      url.pathname === "/typewriter/read") {
    return res.end(JSON.stringify({ value }));
  }

  if (req.method === "POST" &&
      url.pathname === "/typewriter/edit") {
    let body = "";

    req.on("data", chunk => body += chunk);

    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (typeof data.value !== "string") {
          throw new Error("Invalid value");
        }

        value = data.value;
        res.end(JSON.stringify({ success: true, value }));
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(process.env.PORT || 3000);
