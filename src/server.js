import express from "express";

const app = express();
app.set("view engine", "pug"); // pug로 view engine 설정
app.set("views", __dirname + "/views"); // Express에 template이 어디 있는지 지정
app.use("/public", express.static(__dirname + "/public")); // public url을 생성하여 유저에게 파일을 공유함
app.get("/", (_, res) => res.render("home")); // home.pug를 render해주는 route handler를 만듦
app.get("/*", (_, res) => res.render("home")); // user가 어떤 url로 이동하던지 home으로 보냄

const handleListen = () => console.log(`Listening on https://localhost:3000`);

app.listen(3000, handleListen);
