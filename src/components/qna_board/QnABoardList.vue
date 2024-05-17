<script setup>
import QnABoardArticleItem from "@/components/qna_board/item/QnABoardArticleItem.vue";
import { ref, onMounted } from "vue";
const articles = ref([
  {
    articleNo: "1",
    subject: "hihi",
    hit: "122",
    userId: "김싸피",
    registerTime: "2024-05-02",
  },
  {
    articleNo: "2",
    subject: "hihi",
    hit: "122",
    userId: "김싸피",
    registerTime: "2024-05-02",
  },
  {
    articleNo: "3",
    subject: "hihi",
    hit: "122",
    userId: "김싸피",
    registerTime: "2024-05-02",
  },
]);

const getArticleList = () => {};

onMounted(() => {
  getArticleList();
});
</script>
<template>
  <h1>❔ 문의 게시판</h1>
  <table class="table table-hover">
    <thead>
      <tr class="text-center">
        <th scope="col">글번호</th>
        <th scope="col">제목</th>
        <th scope="col">조회수</th>
        <th scope="col">작성자</th>
        <th scope="col">작성일</th>
      </tr>
    </thead>
    <tbody>
      <QnABoardArticleItem
        v-for="article in articles"
        :key="article.articleNo"
        :article="article"
      ></QnABoardArticleItem>
    </tbody>
  </table>
</template>
<style scoped></style>
