<script setup>
import QnABoardArticleItem from "@/components/qna_board/item/QnABoardArticleItem.vue";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { localAxios } from "@/util/http-commons.js";

const route = useRoute();
const local = localAxios();

const articles = ref([]);
const getArticleList = () => {
  local.get("/qna/list").then(({ data }) => {
    articles.value = data.articles;
    console.log(data);
  });
};

onMounted(() => {
  getArticleList();
});
</script>
<template>
  <div class="container">
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
  </div>
</template>
<style scoped></style>
