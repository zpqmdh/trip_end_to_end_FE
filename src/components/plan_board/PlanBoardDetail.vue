<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { localAxios } from "@/util/http-commons.js";

const route = useRoute();
const local = localAxios();

console.log(route.params.id);
</script>
<template>
  <div>Plan Board Detail</div>
</template>
<style scoped></style>
