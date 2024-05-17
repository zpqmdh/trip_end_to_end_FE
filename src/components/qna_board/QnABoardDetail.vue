<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { localAxios } from "@/util/http-commons.js";

const route = useRoute();
const local = localAxios();

console.log(route.params.id);
const getQnADetail = (id) => {
  local.get("/qna/" + id).then(({ data }) => {
    console.log(data);
  });
};
onMounted(() => {
  getQnADetail(route.params.id);
});
</script>
<template>
  <div>QnA Board Detail</div>
  <div>{{ $route.params.id }}</div>
</template>
<style scoped></style>
