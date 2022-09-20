const socket = io(); // io는 자동적으로 back-end socket.io와 연결해주는 function
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const nick = document.getElementById("nickname");
const title = document.getElementsByClassName("title")[0];
const homeBtn = document.getElementsByClassName("home-btn")[0];

room.hidden = true;
nick.hidden = true;
homeBtn.hidden = true;

let roomName;

function handleNicknameSubmit(event) {
  event.preventDefault();

  const input = nick.querySelector("#nick input");
  socket.emit("nickname", roomName, input.value, showRoom);
  input.value = "";
}

function showRoom() {
  nick.hidden = true;
  homeBtn.hidden = false;
  room.hidden = false;

  const msgForm = room.querySelector("#msg");
  const nameForm = nick.querySelector("#nick");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNicknameSubmit);
}

function showNickNameForm(event) {
  welcome.hidden = true;
  homeBtn.hidden = false;
  nick.hidden = false;

  const nameForm = nick.querySelector("#nick");
  nameForm.addEventListener("submit", handleNicknameSubmit);
  nick.querySelector("input").value = "";
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");

  // event name, { arguments ..., }, 서버에서 호출하는 function
  socket.emit("enter_room", input.value, showNickNameForm);
  roomName = input.value;
  title.innerText = roomName;
  input.value = "";
}

function handleHomeClick() {
  location.href = "";
}

function addMessage(message, type, nickname) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  const div = document.createElement("div");
  div.className = "nickname";

  if (type !== undefined) li.className = type;
  if (type === "someone") {
    div.innerText = nickname;
    li.appendChild(div);

    const msgDiv = document.createElement("div");
    msgDiv.innerText = message;
    li.appendChild(msgDiv);
  } else {
    li.innerText = message;
  }

  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(value, "myMessage");
  });
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
homeBtn.addEventListener("click", handleHomeClick);

socket.on("welcome", (user, newCount) => {
  title.innerText = `${roomName} (${newCount})`;
  addMessage(`Welcome ${user}! say Hello 🖐🏻`, "notify");
});

socket.on("bye", (user, newCount) => {
  title.innerText = `${roomName} (${newCount})`;
  addMessage(`${user} left. 😥`, "notify");
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms, newCount) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";

  if (newCount !== undefined && roomName !== undefined) {
    title.innerText = `${roomName} (${newCount})`;
  }

  if (rooms.length === 0) return;

  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
