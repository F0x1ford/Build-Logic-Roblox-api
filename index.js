
const http = require("http");

const SID = "0421";
const value = "Bonjour";

let index = 0;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/") {
    res.writeHead(200);
    return res.end("online");
  }

  if (req.headers.sid !== SID) {
    res.writeHead(403);
    return res.end(JSON.stringify({ error: "Invalid SID" }));
  }

  if (req.method === "GET" &&
      url.pathname === "/typewriter/read") {

    if (index >= value.length) {
      index = 0;
    }

    const letter = value[index];
    index++;

    const binary = Buffer.from(letter, "utf8")
      .toString("hex")
      .match(/.{2}/g)
      .map(byte => parseInt(byte, 16)
        .toString(2)
        .padStart(8, "0"))
      .join("");

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    return res.end(JSON.stringify({
      value: binary
    }));
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(process.env.PORT || 3000);
