<template>
  <div class="chat-container">
    <div class="chat-box" ref="chatBox">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="message.type"
      >
        <div class="message-bubble">{{ message.content }}</div>
      </div>
    </div>
    <div class="input-container">
      <input
        type="text"
        id="userInput"
        placeholder="Type your message..."
        v-model="userInput"
        @keydown.enter="sendMessage"
      />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");
const chatBox = ref(null);
const userInput = ref("");
const messages = ref([]);

const sendMessage = () => {
  if (userInput.value.trim() === "") return;

  const userMessage = { content: userInput.value, type: "user" };
  messages.value.push(userMessage);

  socket.emit("message", { message: userInput.value });

  userInput.value = ""; // Clear the input field

  // Scroll to the bottom of the chat box
  setTimeout(() => {
    chatBox.value.scrollTop = chatBox.value.scrollHeight;
  }, 100);
};

socket.on("response", (data) => {
  const botMessage = { content: data.data, type: "bot" };
  messages.value.push(botMessage);

  // Scroll to the bottom of the chat box
  setTimeout(() => {
    chatBox.value.scrollTop = chatBox.value.scrollHeight;
  }, 100);
});
</script>

<style>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 80vh;
  max-width: 600px;
  margin: auto;
  border: 1px solid #ccc;
  border-radius: 10px;
  overflow: hidden;
}

.chat-box {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.message-bubble {
  padding: 10px;
  border-radius: 15px;
  margin: 5px 0;
  max-width: 75%;
  word-break: break-word;
  white-space: pre-line; /* 공백과 줄바꿈을 유지 */
}

.user .message-bubble {
  align-self: flex-end;
  background-color: #d1e7dd;
  border-bottom-right-radius: 0;
}

.bot .message-bubble {
  align-self: flex-start;
  background-color: #f8d7da;
  border-bottom-left-radius: 0;
}

.input-container {
  display: flex;
  border-top: 1px solid #ccc;
}

input[type="text"] {
  flex: 1;
  padding: 10px;
  border: none;
}

button {
  padding: 10px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
