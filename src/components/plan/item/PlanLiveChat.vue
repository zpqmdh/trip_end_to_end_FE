<template>
  <div id="main-content" class="container">
    <div class="row">
      <div class="col-md-6">
        <form class="form-inline">
          <div class="form-group">
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
        </form>
      </div>
      <div class="col-md-6">
        <form class="form-inline">
          <div class="form-group">
            <label for="content">Type the content</label>
            <input
              type="text"
              id="content"
              v-model="chatObject.content"
              class="form-control"
              placeholder="Your content here..."
            />
          </div>
          <button id="send" class="btn btn-default" type="button" @click.prevent="sendMessage">
            Send
          </button>
        </form>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <table
          id="conversation"
          class="table table-striped"
          :style="{ display: chatObject.conversationDisplay }"
        >
          <thead>
            <tr>
              <th>Messages</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(message, index) in chatObject.messages" :key="index">
              <td>{{ message }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { decodedTokenFunc } from "@/util/auth";
import { localAxios } from "@/util/http-commons.js";

const local = localAxios();
const chatObject = ref({
  stompClient: null,
  nickname: "",
  content: "",
  currentChannel: "default",
  connected: false,
  conversationDisplay: "none",
  messages: [],
});

const setConnected = (connected) => {
  chatObject.value.connected = connected;
  chatObject.value.conversationDisplay = connected ? "block" : "none";
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
  chatObject.value.messages.push(displayMessage);
};

const getMember = async () => {
  const loginedId = decodedTokenFunc();
  const response = await local.get(`/members/detail/${loginedId}`);
  chatObject.value.nickname = response.data.nickname;

  // 채널 이름 입력받고 연결
  chatObject.value.currentChannel = prompt("Enter channel name:");
  connect();
};

onMounted(() => {
  getMember();
});
</script>

<style scoped>
/* 스타일링 필요 시 추가 */
</style>
