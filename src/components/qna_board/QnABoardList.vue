<script setup>
import QnABoardArticleItem from "@/components/qna_board/item/QnABoardArticleItem.vue";
import QnAPageNavigation from "@/components/qna_board/item/QnAPageNavigation.vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons.js";

const router = useRouter();
const local = localAxios();

// article 배열
const articles = ref([]);

// 페이지 네비게이션을 위한 정보
const currentPage = ref(1); // 현재 페이지
const totalPage = ref(0); // 전체 페이지
const key = ref("");
const word = ref("");

// 게시글 목록 정보 가져오기
const getArticleList = () => {
  local
    .get(
      `/qna/list?pgno=${currentPage.value}&key=${key.value}&word=${word.value}`
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

// 게시판 페이지 네비게이션
const onPageChange = (val) => {
  currentPage.value = val;
  getArticleList();
};
// 게시글 작성 페이지로 이동
const moveWrite = () => {
  router.push({ name: "qna-write" });
};
</script>
<template>
  <div class="container">
    <div class="d-flex justify-content-center mt-3">
      <h1>❓ 문의 게시판</h1>
    </div>
    <div>
      <!-- 게시글 작성 버튼 -->
      <div class="d-flex justify-content-end">
        <button id="btn-mv-write" class="btn" @click="moveWrite">글쓰기</button>
      </div>
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
        <QnABoardArticleItem
          v-for="article in articles"
          :key="article.qnaBoardId"
          :article="article"
        ></QnABoardArticleItem>
      </tbody>
    </table>
    <QnAPageNavigation
      :current-page="currentPage"
      :total-page="totalPage"
      @pageChange="onPageChange"
    ></QnAPageNavigation>
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
