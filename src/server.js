import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();
app.set("view engine", "pug"); // pug로 view engine 설정
app.set("views", __dirname + "/views"); // Express에 template이 어디 있는지 지정
app.use("/public", express.static(__dirname + "/public")); // public url을 생성하여 유저에게 파일을 공유함
app.get("/", (_, res) => res.render("home")); // home.pug를 render해주는 route handler를 만듦
app.get("/*", (_, res) => res.render("home")); // user가 어떤 url로 이동하던지 home으로 보냄

const handleListen = () => console.log(`Listening on https://localhost:3000`);

// 같은 서버에서 http, ws 모두 작동시키기 : 2개가 같은 port에 있길 원하는 경우
// http 서버
const server = http.createServer(app);

// websocket 서버 : 이렇게 하면 http서버와 webSocket 서버 둘 다 돌릴 수 있음
const wss = new WebSocket.Server({ server });

wss.on("connection", (socket) => {
  console.log("Connected to Browser 🎀");
  socket.on("close", () => console.log("Disconnected from Browser ❌"));
  socket.on("message", (message) => {
    console.log(Buffer.from(message, "base64").toString("utf-8"));
  });
  socket.send("hello!");
});

server.listen(3000, handleListen);
