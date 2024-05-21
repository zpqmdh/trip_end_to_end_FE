<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { localAxios } from "@/util/http-commons.js";
import { decodedTokenFunc } from "@/util/auth";

const route = useRoute();
const local = localAxios();

const article = ref({
  qnaBoardDto: {},
  commentList: [],
});
const member = ref({});
const author = ref({});

const getQnADetail = (id) => {
  local.get("/qna/" + id).then(({ data }) => {
    article.value = data.article;
    console.log(article.value);
    getAuthor();
  });
};
const getMember = () => {
  const loginedId = decodedTokenFunc();
  local.get(`/members/detail/${loginedId}`).then(({ data }) => {
    member.value = data;
  });
};
const getAuthor = () => {
  local
    .get(`/plans/getMember/${article.value.qnaBoardDto.memberId}`)
    .then(({ data }) => {
      author.value = data;
    });
};
const deleteArticle = () => {
  // TODO: delete 할건지 물어보기
  local
    .delete(`/qna/${article.value.qnaBoardDto.qnaBoardId}`)
    .then(({ data }) => {
      console.log(data);
    });
};
onMounted(() => {
  getQnADetail(route.params.id);
  getMember();
});
</script>
<template>
  <div class="container">
    <h2>{{ article.qnaBoardDto.subject }}</h2>
    <div class="meta">
      <span class="author">👤 작성자: {{ author.nickname }}</span>
      <span class="divider">|</span>
      <span class="views">👁 조회수: {{ article.qnaBoardDto.hit }}</span>
      <span class="divider">|</span>
      <span class="time">🕒 {{ article.qnaBoardDto.registerTime }}</span>
    </div>
    <div class="content">{{ article.qnaBoardDto.content }}</div>
    <template v-if="author.memberId === member.memberId">
      <button @click.prevent="deleteArticle">삭제</button>
    </template>
  </div>
  <hr />
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
.divider {
  color: #999;
}

.content {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}
</style>
