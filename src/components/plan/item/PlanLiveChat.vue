<script setup>
import { ref, onMounted } from "vue";
import { decodedTokenFunc } from "@/util/auth";
import { localAxios } from "@/util/http-commons.js";
import { onBeforeRouteLeave } from "vue-router";

const local = localAxios();
const chatObject = ref({
  stompClient: null,
  nickname: "",
  content: "",
  currentChannel: null,
  connected: false,
  showChat: false,
  messages: [],
});
const toggleChat = () => {
  // 채널 이름 입력받고 연결
  if (!chatObject.value.showChat && chatObject.value.currentChannel === null) {
    chatObject.value.currentChannel = prompt("Enter channel name:");
    connect();
  }
  chatObject.value.showChat = !chatObject.value.showChat;
};
const getMessageClass = (messageType) => {
  switch (messageType) {
    case "JOIN":
      return "join-message";
    case "LEAVE":
      return "leave-message";
    case "SEND":
      return "send-message";
    default:
      return "";
  }
};
const setConnected = (connected) => {
  chatObject.value.connected = connected;
  chatObject.value.messages = []; // Clear messages
};

const connect = () => {
  const socket = new SockJS("http://localhost/tete-chat");
  chatObject.value.stompClient = Stomp.over(socket);
  chatObject.value.stompClient.connect(
    {},
    (frame) => {
      setConnected(true);
      console.log("Connected: " + frame);
      chatObject.value.stompClient.subscribe(
        `/topic/${chatObject.value.currentChannel}`,
        (message) => {
          showMessage(JSON.parse(message.body));
        }
      );
      chatObject.value.stompClient.send(
        `/app/chat.addUser/${chatObject.value.currentChannel}`,
        {},
        JSON.stringify({ nickname: chatObject.value.nickname, content: "JOIN", type: "JOIN" })
      );
    },
    (error) => {
      console.error("Error: " + error);
    }
  );
};

const disconnect = () => {
  if (chatObject.value.stompClient) {
    chatObject.value.stompClient.send(
      `/app/chat.leaveUser/${chatObject.value.currentChannel}`,
      {},
      JSON.stringify({ nickname: chatObject.value.nickname, content: "LEAVE", type: "LEAVE" })
    );
    chatObject.value.stompClient.disconnect(() => {
      setConnected(false);
      console.log("Disconnected");
    });
    chatObject.value.showChat = !chatObject.value.showChat;
  }
};

const sendMessage = () => {
  if (chatObject.value.content && chatObject.value.stompClient) {
    chatObject.value.stompClient.send(
      `/app/chat.sendMessage/${chatObject.value.currentChannel}`,
      {},
      JSON.stringify({
        nickname: chatObject.value.nickname,
        content: chatObject.value.content,
        type: "SEND",
      })
    );
    chatObject.value.content = "";
  }
};

const showMessage = (message) => {
  let displayMessage;
  switch (message.type) {
    case "JOIN":
      displayMessage = `${message.nickname}님이 입장하셨습니다.`;
      break;
    case "LEAVE":
      displayMessage = `${message.nickname}님이 퇴장하셨습니다.`;
      break;
    case "SEND":
      displayMessage = `${message.nickname}: ${message.content}`;
      break;
    default:
      displayMessage = `알 수 없는 메시지 타입: ${message.type}`;
  }
  chatObject.value.messages.push({
    nickname: message.nickname,
    content: displayMessage,
    type: message.type,
  });
};

const getMember = async () => {
  const loginedId = decodedTokenFunc();
  const response = await local.get(`/members/detail/${loginedId}`);
  chatObject.value.nickname = response.data.nickname;
};

onMounted(() => {
  getMember();
});

onBeforeRouteLeave((to, from, next) => {
  disconnect();
  next();
});
</script>

<template>
  <div>
    <div class="livechat-icon" @click="toggleChat">
      <img src="@/assets/img/livechat-icon.png" alt="LiveChat Icon" />
    </div>
    <div v-if="chatObject.showChat" class="chat-overlay">
      <div class="chat-container">
        <div class="offcanvas-title" style="height: 40px">
          <span>친구들과 함께 여행 계획을 세워봐요.</span>
          <button
            id="disconnect"
            class="btn btn-default"
            type="submit"
            :disabled="!chatObject.connected"
            @click.prevent="disconnect"
          >
            나가기
          </button>
        </div>
        <div class="chat-box" ref="chatBox">
          <div v-for="(message, index) in chatObject.messages" :key="index" :class="message.type">
            <div :class="getMessageClass(message.type)">{{ message.content }}</div>
          </div>
        </div>
        <div class="input-container">
          <input
            class="form-control"
            type="text"
            id="userInput"
            placeholder="메시지를 입력하세요..."
            v-model="chatObject.content"
            @keydown.enter="sendMessage"
          />
          <button @click.prevent="sendMessage" class="btn btn-outline-secondary">Send</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.livechat-icon {
  position: fixed;
  top: 90px;
  right: 20px;
  width: 60px;
  height: 60px;
  cursor: pointer;
}
.livechat-icon img {
  width: 100%;
  height: 90%;
  /* border-radius: 50%; */
}

.chat-overlay {
  position: fixed;
  top: 150px;
  right: 0;
  width: 300px;
  height: 400px;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.offcanvas-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f1f1f1;
  border-bottom: 1px solid #ccc;
}

.chat-box {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  background: #f9f9f9;
}

.message-bubble {
  background: #e1ffc7;
  border-radius: 10px;
  padding: 5px 10px;
  margin-bottom: 5px;
}

.input-container {
  display: flex;
  padding: 10px;
  background: #f1f1f1;
  border-top: 1px solid #ccc;
}

.input-container input {
  flex: 1;
  margin-right: 5px;
}

.join-message {
  background-color: #d4edda;
}

.leave-message {
  background-color: #f8d7da;
}

.send-message {
  background-color: #cce5ff;
}
</style>
