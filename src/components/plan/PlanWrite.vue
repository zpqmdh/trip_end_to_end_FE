<script setup>
import { ref } from "vue";
import PlanLiveChat from "./item/PlanLiveChat.vue";
const showChatPopUp = ref(false);
const openChatPopUp = () => {
  showChatPopUp.value = true;
};
const closeChatPopUp = () => {
  showChatPopUp.value = false;
};
</script>
<template>
  <button @click="openChatPopUp">채팅 열기</button>
  <PlanLiveChat v-if="showChatPopUp" @close="closeChatPopUp" />
</template>
<style scoped></style>
