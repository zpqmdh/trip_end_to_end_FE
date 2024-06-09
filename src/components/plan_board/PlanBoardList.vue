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

// 태그 목록 조회
const searchTag = () => {
  if (!tagName.value.trim()) {
    tagResults.value = [];
    return;
  }
  local.get(`/shareplan/tag/${tagName.value}`).then(({ data }) => {
    tagResults.value = data;
  });
};

// 게시글에 달린 태그 검색 -> 필터링
const filterTag = (tag) => {
  const tagIndex = filteredTag.value.findIndex(
    (t) => t.tagTypeId === tag.tagTypeId
  );
  if (tagIndex === -1) {
    // 검색 조건 태그 추가
    filteredTag.value.push(tag);
  } else {
    // 검색 조건 태그 제거
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

// 검색 조건 태그 제거
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

const moveWrite = () => {
  router.push({ name: "share-plan-write" });
};
</script>

<template>
  <div class="main" style="padding: 80px">
    <div class="row">
      <div class="col-md-4 d-flex align-items-center position-relative">
        <div class="fixed-title text-center">
          <h1>🚗 다녀온 여행 공유</h1>
          <div class="text-center mb-4">
            <button
              class="btn btn-primary"
              id="btn-go-write"
              @click="moveWrite"
            >
              게시글 작성하기
            </button>
          </div>
          <form class="text-center mb-4">
            <div class="form-row justify-content-center">
              <div class="d-flex flex-column align-items-center mb-4">
                <label class="mr-sm-3" for="inlineFormCustomSelect"
                  >태그 검색</label
                >
                <input
                  type="text"
                  class="form-control"
                  style="width: 100%; text-align: center"
                  placeholder="Tag"
                  v-model.trim="tagName"
                  @input.prevent="searchTag"
                />
              </div>
            </div>
          </form>
          <div class="text-center mb-4">
            <div class="tags-container">
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
          </div>
          <!-- New section to display search results -->
          <div class="text-center mb-4">
            <div v-if="filteredTag.length > 0">
              <h5>검색 결과</h5>
              <div class="tags-container">
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
          </div>
        </div>
      </div>
      <div class="col-md-7">
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
    </div>
  </div>
</template>

<style scoped>
.html .body {
  width: 100%;
  overflow: hidden;
}
.main {
  background-color: #b5ccce;
  height: 100vh;
}
.form-control {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
}
#btn-go-write {
  margin-top: 10px;
  background-color: #577b8d;
  border-color: #577b8d;
  color: white;
}
#btn-go-write:hover {
  background-color: white;
  border-color: #577b8d;
  color: #577b8d;
}
.active {
  background-color: #5698ad;
  color: #fff;
  border: none;
}
.fixed-title {
  position: fixed;
  width: calc(100% - 30px); /* Adjusted for padding/margin */
  max-width: 400px;
  top: 30%;
  left: 5%;
  padding: 10px;
}
.tags-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}
</style>
