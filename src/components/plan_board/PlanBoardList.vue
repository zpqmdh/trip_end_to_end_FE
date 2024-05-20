<script setup>
import { ref, onMounted } from "vue";
import { localAxios } from "@/util/http-commons.js";
import { useRouter } from "vue-router";
import PlanBoardCard from "./item/PlanBoardCard.vue";

const local = localAxios();
const router = useRouter();

const planArticleList = ref([]);
const filteredArticleList = ref([]);
const filteredTag = ref([]);
const tagName = ref("");
const tagResults = ref([]);

const getArticleList = async () => {
  const { data } = await local.get("/shareplan/list");
  planArticleList.value = data.articles;
  filteredArticleList.value = data.articles;
};

onMounted(() => {
  getArticleList();
});

const searchTag = () => {
  if (!tagName.value.trim()) {
    tagResults.value = [];
    return;
  }
  local.get(`/shareplan/tag/${tagName.value}`).then(({ data }) => {
    tagResults.value = data;
  });
};

const filterTag = (tag) => {
  const tagIndex = filteredTag.value.findIndex(
    (t) => t.tagTypeId === tag.tagTypeId
  );
  if (tagIndex === -1) {
    filteredTag.value.push(tag);
  } else {
    filteredTag.value.splice(tagIndex, 1);
  }

  filteredArticleList.value = planArticleList.value.filter((article) => {
    return filteredTag.value.every((filter) => {
      return article.tagList.some(
        (item) => item.tagTypeId === filter.tagTypeId
      );
    });
  });
};

const removeTag = (tag) => {
  const tagIndex = filteredTag.value.findIndex(
    (t) => t.tagTypeId === tag.tagTypeId
  );
  if (tagIndex !== -1) {
    filteredTag.value.splice(tagIndex, 1);
    filteredArticleList.value = planArticleList.value.filter((article) => {
      return filteredTag.value.every((filter) => {
        return article.tagList.some(
          (item) => item.tagTypeId === filter.tagTypeId
        );
      });
    });
  }
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
      <div class="form-row justify-content-center">
        <div class="d-flex flex-column align-items-center mb-4">
          <label class="mr-sm-2" for="inlineFormCustomSelect">태그 검색</label>
          <input
            type="text"
            class="form-control"
            style="width: 30%; text-align: center"
            placeholder="Tag"
            v-model.trim="tagName"
            @input.prevent="searchTag"
          />
        </div>
      </div>
    </form>
    <div class="text-center mb-4">
      <div
        v-for="tag in tagResults"
        :key="tag.tagTypeId"
        class="d-inline-block"
      >
        <button
          class="btn btn-outline-secondary m-1"
          @click.prevent="filterTag(tag)"
          :class="{ active: filteredTag.includes(tag) }"
        >
          {{ tag.name }}
        </button>
      </div>
    </div>
    <!-- New section to display search results -->
    <div class="text-center mb-4">
      <div v-if="filteredTag.length > 0">
        <h3>검색 결과</h3>
        <div
          v-for="tag in filteredTag"
          :key="tag.tagTypeId"
          class="d-inline-block"
        >
          <button
            class="btn btn-outline-secondary m-1"
            @click.prevent="removeTag(tag)"
            :class="{ active: filteredTag.includes(tag) }"
          >
            {{ tag.name }}
          </button>
        </div>
      </div>
    </div>
    <div class="row">
      <div
        class="col-md-4 mb-4"
        v-for="planArticle in filteredArticleList"
        :key="planArticle.planBoardId"
      >
        <PlanBoardCard :planArticle="planArticle" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.active {
  background-color: #007bff;
  color: #fff;
}
</style>
