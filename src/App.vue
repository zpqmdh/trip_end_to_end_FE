<script setup>
import { RouterView } from "vue-router";
import Navigator from "@/components/common/Navigator.vue";
import Chatbot from "@/components/common/ChatBot.vue";
</script>

<template>
  <div>
    <Navigator />
    <router-view />
    <Chatbot />
  </div>
</template>

<style scoped></style>
