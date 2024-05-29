<script setup>
import { ref } from "vue";
import { io } from "socket.io-client";

// 소켓 연결 설정
// const socket = io("http://192.168.205.52:5000");
const socket = io("http://localhost:5000");

// 참조 변수와 상태 변수 선언
const chatBox = ref(null);
const userInput = ref("");
const messages = ref([]);
const showChatbot = ref(false);
const loading = ref(false); // 로딩 상태 관리

// 챗봇 창 열기/닫기 토글 함수
const toggleChatbot = () => {
  showChatbot.value = !showChatbot.value;
};

// 메세지 전송 함수
const sendMessage = () => {
  if (userInput.value.trim() === "") return;

  const userMessage = { content: userInput.value, type: "user" };
  messages.value.push(userMessage);

  loading.value = true; // 메시지를 보낸 직후 로딩 상태로 설정
  socket.emit("message", { message: userInput.value });

  userInput.value = ""; // 입력 필드 비우기

  // 채팅 박스를 아래로 스크롤
  setTimeout(() => {
    chatBox.value.scrollTop = chatBox.value.scrollHeight;
  }, 100);
};

// 소켓 응답 처리
socket.on("response", (data) => {
  const botMessage = { content: data.data, type: "bot" };
  messages.value.push(botMessage);

  loading.value = false; // 응답을 받은 후 로딩 상태 해제

  // 채팅  박스를 아래로 스크롤
  setTimeout(() => {
    chatBox.value.scrollTop = chatBox.value.scrollHeight;
  }, 100);
});
</script>

<template>
  <div>
    <!-- 챗봇 창을 토글하는 아이콘 -->
    <div class="chatbot-icon" @click="toggleChatbot">
      <img src="@/assets/img/chatbot-icon.png" alt="Chatbot Icon" />
    </div>

    <!-- 챗봇 창이 열려 있을 때 표시되는 오버레이 -->
    <div v-if="showChatbot" class="chat-overlay">
      <div class="chat-container">
        <!-- 챗봇 창의 제목 영역 -->
        <div class="offcanvas-title" style="height: 40px">
          <img src="@/assets/img/chatbot-profile.png" class="profile" alt="" />
          <span>회원님의 여행을 책임지는 AI 어시스턴트입니다</span>
        </div>
        <!-- 메세지 말풍선이 표시되는 영역 -->
        <div class="chat-box" ref="chatBox">
          <!-- 사용자의 메세지와 챗봇의 응답을 반복적으로 표시 -->
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="message.type"
          >
            <div class="message-bubble">{{ message.content }}</div>
          </div>
          <!-- 로딩 상태일 때 표시되는 로딩 아이콘 -->
          <div v-if="loading" class="loading">
            <img src="@/assets/img/loading-icon.gif" alt="Loading..." />
          </div>
        </div>
        <!-- 사용자 입력을 받는 입력 필드와 전송 버튼 -->
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

<style scoped>
/* 챗봇 아이콘 */
.chatbot-icon {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 80px;
  height: 80px;
  cursor: pointer;
}

.chatbot-icon img {
  width: 100%;
  height: 100%;
}

/* 챗봇 오버레이 */
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

/* 챗봇 컨테이너 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  overflow: hidden;
}

/* 챗박스 */
.chat-box {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 말풍선 */
.message-bubble {
  padding: 10px;
  border-radius: 15px;
  margin: 5px 0;

  word-break: break-word;
  white-space: pre-line;
}

/* 사용자 말풍선 */
.user {
  align-self: flex-end;
}

.user .message-bubble {
  background-color: #d1e7dd;
  border-bottom-right-radius: 0;
  max-width: 100%;
}

/* 챗봇 말풍선 */
.bot {
  align-self: flex-start;
}

.bot .message-bubble {
  background-color: #f8d7da;
  border-bottom-left-radius: 0;
  max-width: 75%;
}

/* 입력 컨테이너 */
.input-container {
  display: flex;
  border-top: 1px solid #ccc;
}

input[type="text"] {
  flex: 1;
  padding: 10px;
  border: none;
}

/* 프로필 이미지 */
.profile {
  width: 45px;
  height: 50px;
}

/* 로딩 아이콘 */
.loading img {
  width: 160px;
  height: 100px;
}
</style>
