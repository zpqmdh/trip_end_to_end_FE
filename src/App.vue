<script setup>
import { RouterView } from "vue-router";
import Navigator from "@/components/common/Navigator.vue";
</script>

<template>
  <div>
    <Navigator />
    <router-view />
  </div>
</template>

<style scoped></style>
