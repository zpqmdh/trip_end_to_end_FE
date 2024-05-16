<script setup>
import { ref, onMounted } from "vue";
import { localAxios } from "@/util/http-commons.js";
import { useRouter } from "vue-router";
import PlanBoardCard from "./item/PlanBoardCard.vue";

const local = localAxios();
const router = useRouter();

const planArticleList = ref();
const getArticleList = async () => {
  local.get("shareplan/list").then(({ data }) => {
    console.log(data.articles);
    planArticleList.value = data.articles;
  });
};
onMounted(() => {
  getArticleList();
});
</script>
<template>
  <div>🚗 다녀온 여행 공유</div>

  <button><router-link :to="{ name: 'share-plan-write' }">게시글 작성하기</router-link></button>
  <form>
    <div class="form-row align-items-center">
      <div class="col-7">
        <label class="mr-sm-2" for="inlineFormCustomSelect">태그 검색</label>
        <input type="text" class="form-control" placeholder="Tag" />
      </div>
      <div class="col-auto my-1">
        <button type="submit" class="btn btn-primary">검색</button>
      </div>
    </div>
  </form>
  <PlanBoardCard
    v-for="planArticle in planArticleList"
    :key="planArticle.planBoardId"
    :planArticle="planArticle"
  />
</template>
<style scoped></style>
