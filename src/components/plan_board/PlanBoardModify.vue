<script setup>
import { ref, computed, onMounted } from "vue";
import { localAxios } from "@/util/http-commons.js";
import { useRoute, useRouter } from "vue-router";
import { decodedTokenFunc } from "@/util/auth";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

const local = localAxios();
const route = useRoute();
const router = useRouter();

const planBoardObject = ref({
  planBoard: {},
  tagList: [],
});
const thumbnail = ref("");
onMounted(() => {
  getDetail(route.params.id);
});

const getMember = () => {
  const loginedId = decodedTokenFunc();
  local.get(`/members/detail/${loginedId}`).then(({ data }) => {
    // 관리자 아님 -> 수정 권한 없음
    if (data.memberId != planBoardObject.value.planBoard.memberId) {
      alert("게시글 수정 권한이 없습니다.");
      router.push({ name: "share-plan-list" });
    }
  });
  console.log(planBoardObject.value);
};

const getDetail = () => {
  local.get(`/shareplan/${route.params.id}`).then(({ data }) => {
    planBoardObject.value.planBoard = data.planBoard;
    planBoardObject.value.tagList = data.tagList;
    if (!planBoardObject.value.planBoard.thumbnail.startsWith("http")) {
      planBoardObject.value.planBoard.thumbnail =
        "http://localhost/products/" + planBoardObject.value.planBoard.thumbnail;
    }
    getMember(); // 수정 권한 확인
  });
};

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
const addTag = (tag) => {
  const exists = planBoardObject.value.tagList.some((t) => t.tagTypeId === tag.tagTypeId);
  if (!exists) {
    planBoardObject.value.tagList.push(tag);
  }
};
const removeTag = (tag) => {
  const index = planBoardObject.value.tagList.findIndex((t) => t.tagTypeId === tag.tagTypeId);
  if (index !== -1) {
    planBoardObject.value.tagList.splice(index, 1);
  }
};

const updateArticle = () => {
  console.log(planBoardObject.value);
  const formData = new FormData();
  formData.append(
    "planBoardForm",
    new Blob([JSON.stringify(planBoardObject.value)], {
      type: "application/json",
    })
  );
  formData.append("thumbnail", thumbnail.value);
  local
    .put(`/shareplan/${planBoardObject.value.planBoard.planBoardId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(({ data }) => {
      console.log(data);
      router.push({
        name: "share-plan-detail",
        params: { id: planBoardObject.value.planBoard.planBoardId },
      });
    });
};

// 파일 선택 시 이벤트 핸들러
const onThumbnailChange = (event) => {
  const file = event.target.files[0];
  thumbnail.value = file;
};
</script>

<template>
  <div class="container my-4 p-4 border rounded shadow-sm">
    <!-- Main Section -->
    <div class="row">
      <!-- Title -->
      <div class="col-12 mb-3">
        <input
          id="subject"
          v-model="planBoardObject.planBoard.subject"
          class="form-control form-control-lg"
          type="text"
          placeholder="제목 ..."
          required
        />
      </div>
      <hr />
      <!-- Register Time -->
      <div class="col-12 text-muted text-end mb-4">
        {{ planBoardObject.planBoard.registerTime }}
      </div>
      <!-- Section 1 -->
      <div class="col-md-6 mb-3">
        <!-- Thumbnail -->
        <img
          id="thumbnail"
          :src="planBoardObject.planBoard.thumbnail"
          class="thumbnail img-fluid rounded"
          alt="Thumbnail"
        />
      </div>
      <!-- Section 2 -->
      <div class="col-md-6 mb-3">
        <!-- Thumbnail -->
        <div class="mb-3">
          <label for="thumbnailInput" class="form-label">대표 사진 변경하기</label>
          <input class="form-control" type="file" id="thumbnailInput" @change="onThumbnailChange" />
        </div>
        <!-- Dates -->
        <div class="d-flex justify-content-around mb-3">
          <div>
            <label>시작 날짜</label>
            <input
              class="form-control"
              type="text"
              v-model="planBoardObject.planBoard.startDate"
              readonly
            />
          </div>
          <div>
            <label>종료 날짜</label>
            <input
              class="form-control"
              type="text"
              v-model="planBoardObject.planBoard.endDate"
              readonly
            />
          </div>
        </div>
        <!-- 동반인 수 -->
        <div class="mb-3">동반인 수: {{ planBoardObject.planBoard.theNumberOfMembers }}</div>
        <!-- Content -->
        <div class="mb-3">
          <label>내용</label>
          <QuillEditor
            toolbar="essential"
            theme="snow"
            v-model:content="planBoardObject.planBoard.content"
            content-type="html"
            class="quill-editor"
          />
        </div>
        <!-- Selected Tags -->
        <div class="mb-3">
          <label>선택된 태그</label>
          <div>
            <button
              v-for="selectedTag in planBoardObject.tagList"
              :key="selectedTag.tagTypeId"
              class="btn btn-outline-secondary m-1"
              @click="removeTag(selectedTag)"
            >
              {{ selectedTag.name }} <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
        <!-- Tag 검색 -->
        <div class="mb-3">
          <input
            id="search-tag"
            type="text"
            class="form-control"
            placeholder="Tag 검색"
            v-model="tagName"
            @input.prevent="searchTag"
          />
          <div class="mt-2">
            <button
              v-for="tag in tagResults"
              :key="tag.tagTypeId"
              class="btn btn-outline-primary m-1"
              @click="addTag(tag)"
            >
              {{ tag.name }}
            </button>
          </div>
        </div>
        <!-- 수정 버튼 -->
        <div class="text-center">
          <button class="btn btn-primary" @click="updateArticle">수정</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  background-color: #fff;
}

.thumbnail {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.form-control-lg {
  font-size: 1.25rem;
  padding: 0.5rem 1rem;
}

.text-muted {
  color: #6c757d !important;
}
.quill-editor {
  height: 400px; /* 원하는 높이로 변경 */
}

button.btn-outline-secondary .bi-x {
  margin-left: 5px;
}
</style>
