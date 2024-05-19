<script setup>
import { onMounted, ref } from "vue";
import { localAxios } from "@/util/http-commons.js";
import { useRoute } from "vue-router";

const local = localAxios();
const route = useRoute();

const notice = ref({});
onMounted(() => {
  getDetail(route.params.id);
});
const getDetail = (id) => {
  local.get("/notice/" + id).then(({ data }) => {
    console.log(data);
    notice.value = data;
  });
};
</script>

<template>
  <div class="container">
    <h2>{{ notice.subject }}</h2>
    <hr />
    <div class="meta">
      <span class="author">👤 작성자: {{ notice.nickname }}</span>
      <span class="divider">|</span>
      <span class="views">👁 조회수: {{ notice.hit }}</span>
      <span class="divider">|</span>
      <span class="time">🕒 {{ notice.registerTime }}</span>
    </div>
    <div class="content">{{ notice.content }}</div>
    <RouterLink :to="{ name: 'notice-list' }" class="back-link"
      >목록으로</RouterLink
    >
  </div>
</template>

<style scoped>
.container {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

hr {
  border: none;
  border-top: 1px solid #ccc;
  margin-bottom: 20px;
}

.meta {
  margin-bottom: 20px;
}

.author,
.views,
.time {
  margin-right: 10px;
  font-size: 14px;
  color: #666;
}

.divider {
  color: #999;
}

.content {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.back-link {
  display: inline-block;
  margin-top: 20px;
  color: blue;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
