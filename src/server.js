import http from "http";
import SocketIO from "socket.io";
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
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

// connection
wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";

  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    // socket.to(roomName).emit("welcome", socket.nickname);
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname)
    );
  });
  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (roomName, nickname, done) => {
    socket["nickname"] = nickname;
    done();
    socket.to(roomName).emit("welcome", socket.nickname);
  });
  socket.on("change_nick", (roomName, nickname, done) => {
    const originalNick = socket["nickname"];
    socket["nickname"] = nickname;
    socket
      .to(roomName)
      .emit("change_nick", `${originalNick} changed to ${nickname} 😊`);
    done();
  });
});

// fake database : 누군가 서버에 연결하면 그 connection을 sockets 배열에 넣는다.
const sockets = [];

// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "Anonymous"; // 익명의 경우를 위해 닉네임 초기화, socket안에 정보를 저장할 수 있음
//   console.log("Connected to Browser 🎀");

//   socket.on("close", onSocketClose);
//   socket.on("message", (msg) => {
//     const convertedMsg = converBuffer(msg);
//     const message = JSON.parse(convertedMsg);

//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname}: ${message.payload}`)
//         );
//       case "nickname":
//         socket["nickname"] = message.payload;
//     }
//   });
// });

httpServer.listen(3000, handleListen);
