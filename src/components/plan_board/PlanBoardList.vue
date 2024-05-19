<script setup>
import { ref, onMounted } from "vue";
import { localAxios } from "@/util/http-commons.js";
import { useRouter } from "vue-router";
import PlanBoardCard from "./item/PlanBoardCard.vue";

const local = localAxios();
const router = useRouter();

const planArticleList = ref();
const getArticleList = async () => {
  local.get("/shareplan/list").then(({ data }) => {
    planArticleList.value = data.articles;
  });
};

onMounted(() => {
  getArticleList();
});

const tagName = ref("");
const tagResults = ref([]);
const searchTag = () => {
  if (tagName.value.length == 0 || tagName == null) {
    tagResults.value = null;
    return;
  }
  local.get(`/shareplan/tag/${tagName.value}`).then(({ data }) => {
    console.log(data);
    tagResults.value = data;
  });
};
</script>
<template>
  <div class="container">
    <h1 class="text-center">🚗 다녀온 여행 공유</h1>
    <div class="text-center mb-4">
      <button class="btn btn-primary">
        <router-link :to="{ name: 'share-plan-write' }" class="text-white"
          >게시글 작성하기</router-link
        >
      </button>
    </div>
    <form class="text-center mb-4">
      <div class="form-row align-items-center justify-content-center">
        <div class="d-flex mb-4">
          <label class="mr-sm-2" for="inlineFormCustomSelect">태그 검색</label>
          <input
            type="text"
            class="form-control"
            style="width: 50%; text-align: center"
            placeholder="Tag"
            v-model="tagName"
            @input.prevent="searchTag"
          />
        </div>
      </div>
    </form>
    <div class="text-center mb-4">
      <div v-for="tag in tagResults" :key="tag.name" class="d-inline-block">
        <button class="btn btn-outline-secondary m-1">{{ tag.name }}</button>
      </div>
    </div>
    <div class="row">
      <div
        class="col-md-4 mb-4"
        v-for="planArticle in planArticleList"
        :key="planArticle.planBoardId"
      >
        <PlanBoardCard :planArticle="planArticle" />
      </div>
    </div>
  </div>
</template>
<style scoped></style>
