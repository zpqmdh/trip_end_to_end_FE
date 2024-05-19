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
              :disabled="chatObject.disconnectDisabled"
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
            <label for="name">What is your name?</label>
            <input
              type="text"
              id="name"
              v-model="chatObject.nickname"
              class="form-control"
              placeholder="Your name here..."
            />
            <label for="content">Type the content</label>
            <input
              type="text"
              id="content"
              v-model="chatObject.content"
              class="form-control"
              placeholder="Your content here..."
            />
          </div>
          <button
            id="send"
            class="btn btn-default"
            type="button"
            @click.prevent="sendMessage"
          >
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
              <th>Greetings</th>
            </tr>
          </thead>
          <tbody id="greetings"></tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { localAxios } from "@/util/http-commons.js";
import { decodedTokenFunc } from "@/util/auth";

const local = localAxios();
const chatObject = ref({
  stompClient: null,
  nickname: "",
  content: "",
  currentChannel: "default",
  connected: false,
  conversationDisplay: false,
  greetings: [],
});

const setConnected = (connected) => {
  console.log("check");
  chatObject.value.connected = connected;
  chatObject.value.conversationDisplay = connected ? "block" : "none";
  chatObject.value.greetings = []; // Clear greetings
};

const connect = () => {
  chatObject.value.stompClient.activate();
};

const disconnect = () => {
  if (chatObject.value.stompClient) {
    chatObject.value.stompClient.deactivate();
    setConnected(false);
    console.log("Disconnected");
  }
};

const sendMessage = () => {
  if (chatObject.value.content && chatObject.value.stompClient) {
    chatObject.value.stompClient.publish({
      destination: `/app/chat.sendMessage/${chatObject.value.currentChannel}`,
      body: JSON.stringify({
        nickname: chatObject.value.nickname,
        content: chatObject.value.content,
      }),
    });
    chatObject.value.content = "";
  }
};

const showGreeting = (message) => {
  const greetings = document.getElementById("greetings");
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  td.appendChild(document.createTextNode(message));
  tr.appendChild(td);
  greetings.appendChild(tr);
};

const getMemberNickname = () => {
  const loginedId = decodedTokenFunc();
  local.get(`/members/detail/${loginedId}`).then(({ data }) => {
    chatObject.value.nickname = data.nickname;
  });
};

onMounted(() => {
  chatObject.value.currentChannel = prompt("Enter channel name:");
  getMemberNickname();
  chatObject.value.stompClient = new StompJs.Client({
    brokerURL: "ws://localhost/tete-chat",
    connectHeaders: {},
    debug: (str) => {
      console.log(str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: (frame) => {
      setConnected(true);
      console.log("Connected: " + frame);
      chatObject.value.stompClient.subscribe(
        `/topic/${chatObject.value.currentChannel}`,
        (greeting) => {
          showGreeting(JSON.parse(greeting.body).content);
        }
      );
    },
    onStompError: (frame) => {
      console.error(frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    },
  });
  connect();
});
</script>

<style scoped>
/* 스타일링 필요 시 추가 */
</style>
