<script setup>
import { useRouter } from "vue-router";
defineProps({ article: Object });

const router = useRouter();
const mvDetail = (id) => {
  router.push({ name: "notice-detail", params: { id: id } });
};
</script>
<template>
  <tr class="text-center">
    <td v-if="article.isFixed === null || article.isFixed == false || article.isFixed == 'false'">
      {{ article.noticeBoardId }}
    </td>
    <td v-else>🚩</td>
    <td>
      <a href="#" @click="mvDetail(article.noticeBoardId)" id="subject">{{ article.subject }}</a>
    </td>
    <td>{{ article.hit }}</td>
    <td>{{ article.nickname }}</td>
    <td>{{ article.registerTime }}</td>
  </tr>
</template>
<style scoped>
#subject {
  text-decoration: none;
  color: black;
}
#subject:hover {
  color: #577b8d;
}
</style>
