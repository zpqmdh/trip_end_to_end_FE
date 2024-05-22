<script setup>
import NoticeBoardArticleItem from "./item/NoticeBoardArticleItem.vue";
import NoticePageNavigation from "./item/NoticePageNavigation.vue";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons.js";
import { decodedTokenFunc } from "@/util/auth";

const route = useRoute();
const router = useRouter();
const local = localAxios();

const articles = ref([]);
const member = ref({});
const currentPage = ref(1);
const totalPage = ref(0);
const key = ref("");
const word = ref("");

const getArticleList = () => {
  local
    .get(`/notice/list?pgno=${currentPage.value}&key=${key.value}&word=${word.value}`)
    .then(({ data }) => {
      articles.value = data.articles;
      currentPage.value = data.pageNavigation.currentPage;
      totalPage.value = data.pageNavigation.totalPageCount;

      console.log(data);
    });
};

const getMember = () => {
  const loginedId = decodedTokenFunc();
  local.get(`/members/detail/${loginedId}`).then(({ data }) => {
    console.log(data);
    member.value = data;
  });
};

onMounted(() => {
  getMember();
  getArticleList();
});

const onPageChange = (val) => {
  currentPage.value = val;
  getArticleList();
};

const moveWrite = () => {
  router.push({ name: "notice-write" });
};
</script>
<template>
  <div class="container">
    <div class="d-flex justify-content-center mt-3">
      <h1>📢 공지사항</h1>
    </div>
    <div v-if="member.type == 3" class="d-flex justify-content-end">
      <button id="btn-mv-write" class="btn" @click="moveWrite">글쓰기</button>
    </div>
    <table class="table table-hover mt-3">
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
<style scoped>
#btn-mv-write {
  border-color: #97654c;
  background-color: #fff;
  color: #97654c;
  margin-right: 20px;
}
#btn-mv-write:hover {
  background-color: #97654c;
  color: white;
  margin-right: 20px;
}
</style>
