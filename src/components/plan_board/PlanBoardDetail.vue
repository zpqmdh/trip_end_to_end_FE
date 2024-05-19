<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { localAxios } from "@/util/http-commons.js";
import { decodedTokenFunc } from "@/util/auth";

const route = useRoute();
const local = localAxios();

const planBoardObject = ref({
  planBoard: {},
  commentList: [],
  likeList: [],
  tagList: [],
});
const newComment = ref({
  planBoardId: "",
  memberId: "",
  content: "",
  depth: "-1",
  commentGroup: "-1",
});
const editingComment = ref(null); // 현재 편집 중인 댓글의 ID
const updateComment = ref({
  commentId: -1,
  content: "",
});

onMounted(() => {
  getDetail();

  const loginedId = decodedTokenFunc();
  local.get(`/members/detail/${loginedId}`).then(({ data }) => {
    newComment.value.memberId = data.memberId;
  });
});

const getDetail = () => {
  local.get(`/shareplan/${route.params.id}`).then(({ data }) => {
    newComment.value.planBoardId = data.planBoard.planBoardId;
    planBoardObject.value.planBoard = data.planBoard;
    planBoardObject.value.commentList = data.commentList;
    planBoardObject.value.likeList = data.likeList;
    planBoardObject.value.tagList = data.tagList;
    console.log(planBoardObject.value);
  });
};

const addComment = () => {
  local
    .post(
      `/shareplan/insert/${newComment.value.planBoardId}/comment`,
      newComment.value
    )
    .then(() => {
      getDetail();
      newComment.value.content = "";
    });
};

const replyToComment = (commentId) => {
  console.log(`Reply to comment ${commentId}`);
};

const startEditingComment = (comment) => {
  editingComment.value = comment.commentId;
  updateComment.value.commentId = comment.commentId;
  updateComment.value.content = comment.content;
};

const saveEditComment = (commentId) => {
  local.put(`/shareplan/comment/${commentId}`, updateComment.value).then(() => {
    getDetail();
    editingComment.value = null;
  });
};

const deleteComment = (commentId) => {
  local.delete(`/shareplan/comment/${commentId}`).then(() => {
    getDetail();
  });
};
</script>

<template>
  <div class="container">
    <!-- Main Section -->
    <div class="row mx-5">
      <!-- title -->
      <h3 class="header">{{ planBoardObject.planBoard.subject }}</h3>
      <hr />
      <!-- register time-->
      <div class="register-time">
        {{ planBoardObject.planBoard.registerTime }}
      </div>
      <!-- Section 1 -->
      <div class="col-md-6">
        <!-- thumbnail-->
        <img id="thumbnail" :src="planBoardObject.planBoard.thumbnail" />
      </div>
      <!-- Section 2 -->
      <div class="col-md-6">
        <div class="mb-3">
          <!-- Date -->
          <div class="d-flex">
            <div class="mb-3">
              <span>시작 날짜</span>
              <input
                class="mx-1"
                type="text"
                v-model="planBoardObject.planBoard.startDate"
                readonly
              />
            </div>
            <div>
              <span>종료 날짜</span>
              <input
                class="mx-1"
                type="text"
                v-model="planBoardObject.planBoard.endDate"
                readonly
              />
            </div>
          </div>
          <!-- Content -->
          <div
            class="content-box"
            v-html="planBoardObject.planBoard.content"
          ></div>
        </div>
      </div>
    </div>
    <!-- Comment Section -->
    <div class="comment-section">
      <h4>댓글</h4>
      <div class="comment-form">
        <textarea
          v-model="newComment.content"
          placeholder="댓글을 입력하세요..."
          class="form-control"
          rows="3"
        ></textarea>
        <button @click="addComment" class="btn btn-primary mt-2">
          댓글 달기
        </button>
      </div>
      <div class="comment-list mt-4">
        <div
          v-for="comment in planBoardObject.commentList"
          :key="comment.id"
          class="comment-item"
        >
          <!-- 존재하는 댓글 -->
          <template v-if="comment.deleted == 0">
            <div v-if="editingComment !== comment.commentId">
              <p>작성자: {{ comment.memberId }}</p>
              <p>{{ comment.registerTime }}</p>
              <p>{{ comment.content }}</p>
              <div class="comment-actions">
                <button
                  @click="replyToComment(comment.commentId)"
                  class="btn btn-secondary btn-sm"
                >
                  답글 달기
                </button>
                <button
                  @click="startEditingComment(comment)"
                  class="btn btn-warning btn-sm"
                >
                  수정
                </button>
                <button
                  @click="deleteComment(comment.commentId)"
                  class="btn btn-danger btn-sm"
                >
                  삭제
                </button>
              </div>
            </div>
            <div v-else>
              <textarea
                v-model="updateComment.content"
                class="form-control"
                rows="2"
              ></textarea>
              <button
                @click="saveEditComment(comment.commentId)"
                class="btn btn-primary mt-2"
              >
                저장
              </button>
            </div>
          </template>
          <!-- 삭제된 댓글 -->
          <template v-if="comment.deleted == 1">
            <div v-if="comment.depth != 0" class="col-1"></div>
            <div class="col">
              <p>
                <strong> - </strong>
              </p>
              <p>삭제된 댓글입니다.</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
  text-align: center;
  margin-top: 10px;
}

#thumbnail {
  width: 50%;
  height: auto;
  display: block;
  margin: auto;
}

.content-box {
  background-color: #f0f0f0;
  min-height: 100px;
  padding: 10px;
  overflow: auto;
}

.register-time {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
}

.comment-section {
  margin-top: 20px;
}

.comment-form textarea {
  width: 100%;
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.comment-item {
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}
</style>
