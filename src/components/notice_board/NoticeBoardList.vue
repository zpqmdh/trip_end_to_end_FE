<script setup>
import NoticeBoardArticleItem from "./item/NoticeBoardArticleItem.vue";
import NoticePageNavigation from "./item/NoticePageNavigation.vue";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { localAxios } from "@/util/http-commons.js";

const route = useRoute();
const local = localAxios();

const articles = ref([]);

const currentPage = ref(1);
const totalPage = ref(0);
const key = ref("");
const word = ref("");

const getArticleList = () => {
  local
    .get(
      `/notice/list?pgno=${currentPage.value}&key=${key.value}&word=${word.value}`
    )
    .then(({ data }) => {
      articles.value = data.articles;
      currentPage.value = data.pageNavigation.currentPage;
      totalPage.value = data.pageNavigation.totalPageCount;

      console.log(data);
    });
};

onMounted(() => {
  getArticleList();
});

const onPageChange = (val) => {
  currentPage.value = val;
  getArticleList();
};
</script>
<template>
  <div class="container">
    <h1>❔ 공지사항</h1>
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
        <NoticeBoardArticleItem
          v-for="article in articles"
          :key="article.articleNo"
          :article="article"
        ></NoticeBoardArticleItem>
      </tbody>
    </table>
    <NoticePageNavigation
      :current-page="currentPage"
      :total-page="totalPage"
      @pageChange="onPageChange"
    ></NoticePageNavigation>
  </div>
</template>
<style scoped></style>
