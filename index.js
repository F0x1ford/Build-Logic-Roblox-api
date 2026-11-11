
const http = require("http");

const SID = "0421";
let value = "Bonjour";

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/") {
    res.writeHead(200, {
      "Content-Type": "text/plain"
    });
    return res.end("online");
  }

  if (req.headers.sid !== SID) {
    res.writeHead(403);
    return res.end("Invalid SID");
  }

  if (req.method === "GET" &&
      url.pathname === "/typewriter/read") {

    const binary = Buffer.from(value, "utf8")
      .toString("hex")
      .match(/.{2}/g)
      .map(byte => parseInt(byte, 16)
        .toString(2)
        .padStart(8, "0"))
      .join("");

    res.writeHead(200, {
      "Content-Type": "text/plain"
    });

    return res.end(binary);
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(process.env.PORT || 3000);
