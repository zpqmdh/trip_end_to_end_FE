<script setup>
import { useRouter } from "vue-router";
defineProps({ article: Object });

const router = useRouter();
const mvDetail = (id) => {
  router.push({ name: "qna-detail", params: { id: id } });
};
</script>
<template>
  <tr class="text-center">
    <td>{{ article.qnaBoardId }}</td>
    <td>
      <template v-if="article.secret != 0"
        ><img src="@/assets/img/lock.png" style="height: 20px; width: auto; margin-right: 3px"
      /></template>
      <a href="#" @click="mvDetail(article.qnaBoardId)" id="subject">{{ article.subject }}</a>
      <template v-if="article.isAnswered != 0"
        ><button id="comment-state" class="btn" disabled>답변완료</button>
      </template>
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
#comment-state {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  color: #fff;
  background-color: #577b8d;
  margin-left: 3px;
  border-radius: 10px;
}
</style>
