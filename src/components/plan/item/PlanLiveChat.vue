<script setup>
import { ref, onMounted, watch } from "vue";
import { decodedTokenFunc } from "@/util/auth";
import { localAxios } from "@/util/http-commons.js";
import { onBeforeRouteLeave } from "vue-router";
const { VITE_LOCALHOST_URL } = import.meta.env;
const props = defineProps({
  planDto: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});
const local = localAxios();
const chatBox = ref(null);

const colors = ["blue-message", "purple-message", "orange-message"];
const chatObject = ref({
  showToggle: true,
  stompClient: null,
  member: {
    memberId: "",
    nickname: "",
    image: "",
    colorIdx: "",
  },
  content: "",
  currentChannel: null,
  connected: false,
  showChat: false,
  messages: [],
});

const checkDate = () => {
  if (!props.planDto || !props.planDto.endDate) {
    console.error("planDto or planDto.endDate is missing");
    return;
  }
  let today = new Date();
  let year = today.getFullYear();
  let month = ("0" + (today.getMonth() + 1)).slice(-2);
  let day = ("0" + today.getDate()).slice(-2);

  let dateString = `${year}-${month}-${day}`;
  const todayDate = new Date(dateString);

  if (new Date(props.planDto.endDate) < todayDate) {
    chatObject.value.showToggle = false; // 종료된 여행 계획이면 실시간 채팅 X
  }
};

const toggleChat = () => {
  if (!chatObject.value.showChat && chatObject.value.currentChannel === null) {
    getCurrentChannel();
  }
  chatObject.value.showChat = !chatObject.value.showChat;
};
const getCurrentChannel = () => {
  local.get(`/plans/detail/${props.planDto.planId}`).then(({ data }) => {
    chatObject.value.currentChannel = data.planDto.planId;
    if (chatObject.value.currentChannel === null) return;
    checkAuthorization(data.memberIds);
  });
};
const checkAuthorization = (memberList) => {
  console.log(memberList);
  let flag = false;
  memberList.forEach((member) => {
    if (member.memberId == chatObject.value.member.memberId) flag = true;
  });
  if (flag) connect(); // 해당 여행 계획에 포함되어 있어야만 채팅채널에 접근 가능
};

const getMessageClass = (messageType, colorIdx) => {
  switch (messageType) {
    case "JOIN":
      return "join-message";
    case "LEAVE":
      return "leave-message";
    case "SEND":
      return `${colors[colorIdx]} send-message`;
    default:
      return "";
  }
};

const setConnected = (connected) => {
  chatObject.value.connected = connected;
  chatObject.value.messages = []; // Clear messages
};

const connect = () => {
  const socket = new SockJS(`http://${VITE_LOCALHOST_URL}/tete-chat`);
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
      // connect 할 때 임의로 배경색 지정 -> 유저마다 별도의 고유값 할당
      const colorIdx = Math.floor(Math.random() * colors.length);
      chatObject.value.member.colorIdx = colorIdx;

      chatObject.value.stompClient.send(
        `/app/chat.addUser/${chatObject.value.currentChannel}`,
        {},
        JSON.stringify({
          nickname: chatObject.value.member.nickname,
          image: chatObject.value.member.image,
          content: "JOIN",
          type: "JOIN",
          colorIdx: chatObject.value.member.colorIdx,
        })
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
      JSON.stringify({
        nickname: chatObject.value.member.nickname,
        image: chatObject.value.member.image,
        content: "LEAVE",
        type: "LEAVE",
        colorIdx: chatObject.value.member.colorIdx,
      })
    );
    chatObject.value.stompClient.disconnect(() => {
      setConnected(false);
      console.log("Disconnected");
    });
    chatObject.value.showChat = !chatObject.value.showChat;
    chatObject.value.currentChannel = null;
  }
};
const sendMessage = () => {
  if (chatObject.value.content && chatObject.value.stompClient) {
    chatObject.value.stompClient.send(
      `/app/chat.sendMessage/${chatObject.value.currentChannel}`,
      {},
      JSON.stringify({
        nickname: chatObject.value.member.nickname,
        image: chatObject.value.member.image,
        content: chatObject.value.content,
        type: "SEND",
        colorIdx: chatObject.value.member.colorIdx,
      })
    );
    chatObject.value.content = "";
  }
};

const showMessage = (message) => {
  if (!message.image.startsWith("http")) {
    message.image = `http://${VITE_LOCALHOST_URL}/products/` + message.image;
  }
  setTimeout(() => {
    chatBox.value.scrollTop = chatBox.value.scrollHeight;
  }, 100);
  chatObject.value.messages.push(message);
};

const getMember = async () => {
  const loginedId = decodedTokenFunc();
  const response = await local.get(`/members/detail/${loginedId}`);
  chatObject.value.member.memberId = response.data.memberId;
  chatObject.value.member.image = response.data.image;
  chatObject.value.member.nickname = response.data.nickname;
  chatObject.value.member.backgroundColor = colors[response.data.colorIdx];
  console.log(chatObject.value);
};

onMounted(() => {
  if (props.planDto && props.planDto.endDate) {
    checkDate();
  }
  getMember();
});
watch(
  () => props.planDto,
  (newVal) => {
    if (newVal && newVal.endDate) {
      checkDate();
    }
  },
  { immediate: true }
);
onBeforeRouteLeave((to, from, next) => {
  disconnect();
  next();
});
</script>

<template>
  <div>
    <div class="livechat-icon" @click="toggleChat" v-if="chatObject.showToggle">
      <img src="@/assets/img/live-icon.png" alt="LiveChat Icon" />
    </div>
    <div v-if="chatObject.showChat" class="chat-overlay">
      <div class="chat-container">
        <div class="offcanvas-title" style="height: 40px">
          <span>친구들과 함께 여행 계획을 세워봐요.</span>
        </div>
        <div class="chat-box" ref="chatBox">
          <div v-for="(message, index) in chatObject.messages" :key="index" :class="message.type">
            <div :class="getMessageClass(message.type, message.colorIdx)" class="message-bubble">
              <template v-if="message.type === 'SEND'">
                <img :src="message.image" class="profile-img" alt="Profile Image" />
                <div class="message-content">
                  <div class="nickname">{{ message.nickname }}</div>
                  <div class="content">{{ message.content }}</div>
                </div>
              </template>
              <template v-else>
                <div class="content">{{ message.content }}</div>
              </template>
            </div>
          </div>
        </div>
        <div class="input-container">
          <input
            class="form-control"
            type="text"
            id="userInput"
            placeholder="메시지를 입력하세요..."
            v-model="chatObject.content"
            @keyup.enter="sendMessage"
          />
          <button @click.prevent="sendMessage" class="btn btn-outline-secondary">전송</button>
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
}
.chat-overlay {
  position: fixed;
  top: 150px;
  right: 0;
  width: 400px;
  height: 600px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 9999;
}
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 10px;
  background: transparent;
}
.chat-box {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  background: transparent;
}
.offcanvas-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f1f1f1;
  border-bottom: 1px solid #ccc;
}
.message-bubble {
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
  text-align: center;
}

.leave-message {
  background-color: #f8d7da;
  text-align: center;
}

.send-message {
  display: flex;
  align-items: center;
}

.blue-message {
  background-color: #d2e1ea;
}

.purple-message {
  background-color: #e0d3ea;
}

.orange-message {
  background-color: #eedfd8;
}

.profile-img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.message-content {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-weight: bold;
}

.content {
  margin-top: 5px;
}
</style>
