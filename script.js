const btn = document.getElementById("btn");
const input = document.getElementById("input");
const messages = document.getElementById("message");
const userCountDisplay = document.getElementById("onlineUser");
const form = document.getElementById("message-form");
const typingDisplay = document.getElementById("typing");

let isTyping = false;
let typingTimeout;

// Function to add a message to the chat
function addMessage(content, isSentByMe = false) {
  const messageElement = document.createElement("div");
  messageElement.className = isSentByMe
    ? "flex flex-col items-end justify-end"
    : "flex flex-col items-start relative";

  const nameElement = document.createElement("h6");
  nameElement.className = "ml-1 text-xs font-bold";
  nameElement.innerText = isSentByMe ? "Me" : content.name;
  messageElement.appendChild(nameElement);

  const bubbleElement = document.createElement("div");
  bubbleElement.className = isSentByMe
    ? "message-bubble-sent p-2 px-3 rounded-tl-full rounded-br-full rounded-bl-full text-white max-w-xs"
    : "message-bubble p-2 px-3 rounded-tr-full rounded-br-full rounded-bl-full text-white max-w-xs";
  bubbleElement.innerHTML = `<p>${content.message}</p>`;
  messageElement.appendChild(bubbleElement);

  messages.appendChild(messageElement);
  messages.scrollTop = messages.scrollHeight;
}

// Function to add a "user joined" message
function addUserJoinedMessage(name) {
  const userJoinedElement = document.createElement("div");
  userJoinedElement.className =
    "w-full bg-gray-800 rounded-lg p-1 text-center font-semibold";
  userJoinedElement.innerHTML = `<h1>${name} joined the chat</h1>`;
  messages.appendChild(userJoinedElement);
  messages.scrollTop = messages.scrollHeight;
}

// Function to send a message
function sendMessage() {
  if (input.value.trim()) {
    socket.emit("send", input.value.trim());
    addMessage({ message: input.value.trim() }, true);
    input.value = "";
    stopTyping();
  }
}

// Handle message sending on button click or Enter key press
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent default form submission
  sendMessage();
});

btn.addEventListener("click", sendMessage);

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevent default Enter key behavior
    sendMessage();
  } else {
    handleTyping();
  }
});

// Handle typing events
input.addEventListener("input", handleTyping);

function handleTyping() {
  if (!isTyping) {
    isTyping = true;
    socket.emit("typing");
    typingTimeout = setTimeout(stopTyping, 3000);
  } else {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(stopTyping, 3000);
  }
}

function stopTyping() {
  isTyping = false;
  socket.emit("stop-typing");
}

let name;
while (!name) {
  const inputName = prompt("Who are you?");
  if (inputName && inputName.trim().length > 0) {
    name = inputName.trim();
    socket.emit("new-user-join", name);
  } else {
    alert("Name is required to join the chat.");
  }
}

socket.on("user-joined", (name) => {
  addUserJoinedMessage(name);
});

socket.on("receive", (data) => {
  addMessage(data);
});

socket.on("name-error", (message) => {
  alert(message);
});

socket.on("update-user-count", (count) => {
  userCountDisplay.innerText = `${count} Online`;
});

// Show typing notifications
socket.on("user-typing", (name) => {
  typingDisplay.innerText = `${name} is typing...`;
});

socket.on("user-stopped-typing", () => {
  typingDisplay.innerText = "";
});

socket.on("user-left", (name) => {
  const userLeftElement = document.createElement("div");
  userLeftElement.className =
    "w-full bg-gray-800 rounded-lg p-1 text-center font-semibold";
  userLeftElement.innerHTML = `<h1>${name} left the chat</h1>`;
  messages.appendChild(userLeftElement);
  messages.scrollTop = messages.scrollHeight;
});
