const socket = io();
console.log("INIT SOKET IO")
const inboxPeople = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const fallback = document.querySelector(".fallback");

let userName = "";

const newUserConnected = (user) => {
    
  userName = user || `User${Math.floor(Math.random() * 1000000)}`;

  console.log("newUserConnected userName:",userName)
  
  socket.emit("new user", userName);
  addToUsersBox(userName);
};

const addToUsersBox = (userName) => {
    console.log("userName 1")
  if (!!document.querySelector(`.${userName}-userlist`)) {
    return;
  }
  console.log("userName 2")
  const userBox = `
    <div class="chat_ib ${userName}-userlist">
      <h5>${userName}</h5>
    </div>
  `;
  console.log("userBox:",userBox)
  inboxPeople.innerHTML += userBox;
};

const addNewMessage = ({ user, message }) => {
    console.log("addNewMessage user:",user)
    console.log("addNewMessage message:",message)
  const time = new Date();
  const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

  const receivedMsg = `
  <div class="incoming__message">
    <div class="received__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="message__author">${user}</span>
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;

  const myMsg = `
  <div class="outgoing__message">
    <div class="sent__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;
  messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};

// new user is created so we generate nickname and emit event
newUserConnected();

messageForm.addEventListener("submit", (e) => {
  console.log("messageForm:",e)
  e.preventDefault();
  if (!inputField.value) {
    return;
  }
  console.log("messageForm ok:",e)
  socket.emit("chat message", {
    message: inputField.value,
    nick: userName,
  });

  console.log("INFO:",{
    message: inputField.value,
    nick: userName,
  })
  inputField.value = "";
});

inputField.addEventListener("keyup", () => {
  socket.emit("typing", {
    isTyping: inputField.value.length > 0,
    nick: userName,
  });
});

socket.on("new user", function (data) {
    console.log("on new user",data)
  data.map((user) => addToUsersBox(user));
});

socket.on("user disconnected", function (userName) {
    console.log("disconnected user",userName)
  document.querySelector(`.${userName}-userlist`).remove();
});

socket.on("chat message", function (data) {
    console.log("chat message:",data)
  addNewMessage({ user: data.nick, message: data.message });
});


socket.on("typing", function (data) {
  const { isTyping, nick } = data;

  if (!isTyping) {
    fallback.innerHTML = "";
    return;
  }

  fallback.innerHTML = `<p>${nick} is typing...</p>`;
});