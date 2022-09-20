import http from "http";
import { Server } from "socket.io";
const { instrument } = require("@socket.io/admin-ui");
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
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  // const sids = wsServer.sockets.adapter.sids;
  // const rooms = wsServer.sockets.adapter.rooms;

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });

  return publicRooms;
}

// user count
function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

// connection
wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";

  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();

    // 메세지를 모든 소켓에 보냄
    wsServer.sockets.emit("room_change", publicRooms(), countRoom(roomName));
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", msg, "someone", socket.nickname);
    done();
  });
  socket.on("nickname", (roomName, nickname, done) => {
    socket["nickname"] = nickname;
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
  });
});

httpServer.listen(3000, handleListen);
