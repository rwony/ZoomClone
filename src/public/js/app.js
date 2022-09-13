const socket = io(); // io는 자동적으로 back-end socket.io와 연결해주는 function

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const nick = document.getElementById("nickname");

room.hidden = true;
nick.hidden = true;

let roomName;

// 닉네임 첫 설정인지 변경인지 알기위한 변수 선언
let nickFlag = true;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = nick.querySelector("#nick input");
  const newNick = input.value;

  if (nickFlag) {
    socket.emit("nickname", roomName, input.value, showRoom);
  } else {
    socket.emit("change_nick", roomName, input.value, () =>
      addMessage(`Your nickname changed to ${newNick} 😊`)
    );
  }

  nickFlag = false;
  input.value = "";
}

function showRoom() {
  room.hidden = false;

  const h3 = room.querySelector("h3");
  const msgForm = room.querySelector("#msg");
  const nameForm = nick.querySelector("#nick");

  h3.innerText = `Room ${roomName}`;
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNicknameSubmit);
}

function showNickNameForm(event) {
  welcome.hidden = true;
  nick.hidden = false;

  const nameForm = nick.querySelector("#nick");
  nameForm.addEventListener("submit", handleNicknameSubmit);
  nick.querySelector("input").value = "";
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");

  // event name, { arguments ..., }, 서버에서 호출하는 function
  // socket.emit("enter_room", input.value, showRoom);
  socket.emit("enter_room", input.value, showNickNameForm);
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
  addMessage(`${user} arrived. say Hello!`);
});

socket.on("bye", (left) => {
  addMessage(`${left} left. 😥`);
});

socket.on("new_message", addMessage);
socket.on("change_nick", addMessage);
