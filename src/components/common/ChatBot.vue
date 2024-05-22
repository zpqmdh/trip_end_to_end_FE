<template>
  <div>
    <div class="chatbot-icon" @click="toggleChatbot">
      <img src="@/assets/img/chatbot-icon.png" alt="Chatbot Icon" />
    </div>

    <div v-if="showChatbot" class="chat-overlay">
      <div class="chat-container">
        <div class="offcanvas-title" style="height: 40px">
          <img src="@/assets/img/chatbot-profile.png" class="profile" alt="" />
          <span>회원님의 여행을 책임지는 AI 어시스턴트입니다</span>
        </div>
        <div class="chat-box" ref="chatBox">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="message.type"
          >
            <div class="message-bubble">{{ message.content }}</div>
          </div>
          <div v-if="loading" class="loading">
            <img src="@/assets/img/loading-icon.gif" alt="Loading..." />
          </div>
        </div>
        <div class="input-container">
          <input
            class="form-control"
            type="text"
            id="userInput"
            placeholder="메세지를 입력하세요..."
            v-model="userInput"
            @keydown.enter="sendMessage"
          />
          <button @click="sendMessage" class="btn btn-outline-secondary">
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { io } from "socket.io-client";

const socket = io("http://192.168.205.52:5000");
const chatBox = ref(null);
const userInput = ref("");
const messages = ref([]);
const showChatbot = ref(false);
const loading = ref(false); // 로딩 상태 관리

const toggleChatbot = () => {
  showChatbot.value = !showChatbot.value;
};

const sendMessage = () => {
  if (userInput.value.trim() === "") return;

  const userMessage = { content: userInput.value, type: "user" };
  messages.value.push(userMessage);

  loading.value = true; // 메시지를 보낸 직후 로딩 상태로 설정
  socket.emit("message", { message: userInput.value });

  userInput.value = ""; // Clear the input field

  // Scroll to the bottom of the chat box
  setTimeout(() => {
    chatBox.value.scrollTop = chatBox.value.scrollHeight;
  }, 100);
};

// socket.on("response", (data) => {
//   const botMessage = { content: data.data, type: "bot" };
//   messages.value.push(botMessage);

//   loading.value = false; // 응답을 받은 후 로딩 상태 해제

//   // Scroll to the bottom of the chat box
//   setTimeout(() => {
//     chatBox.value.scrollTop = chatBox.value.scrollHeight;
//   }, 100);
// });
</script>

<style scoped>
.chatbot-icon {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  cursor: pointer;
}

.chatbot-icon img {
  width: 100%;
  height: 100%;
  /* border-radius: 50%; */
}

.chat-overlay {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 450px;
  max-width: 90%;
  height: 70vh;
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
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

  word-break: break-word;
  white-space: pre-line; /* 공백과 줄바꿈을 유지 */
}

.user {
  align-self: flex-end;
}

.user .message-bubble {
  background-color: #d1e7dd;
  border-bottom-right-radius: 0;
  max-width: 100%;
}

.bot {
  align-self: flex-start;
}

.bot .message-bubble {
  background-color: #f8d7da;
  border-bottom-left-radius: 0;
  max-width: 75%;
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

.profile {
  width: 45px;
  height: 50px;
}

.loading img {
  width: 160px; /* 원하는 크기로 조절 */
  height: 100px; /* 원하는 크기로 조절 */
}
</style>
