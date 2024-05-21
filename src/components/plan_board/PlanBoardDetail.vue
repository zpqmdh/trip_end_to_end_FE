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
const newLike = ref({
  memberId: "",
  planBoardId: "",
});

const memberId = ref("");
const isClickedLike = ref(null);
onMounted(() => {
  const loginedId = decodedTokenFunc();
  local.get(`/members/detail/${loginedId}`).then(({ data }) => {
    memberId.value = data.memberId;
    newComment.value.memberId = data.memberId;
    newLike.value.memberId = data.memberId;
  });
  getDetail();
});

const getDetail = () => {
  local.get(`/shareplan/${route.params.id}`).then(({ data }) => {
    console.log(data);
    // comment, like 에 planBoardId 추가
    newComment.value.planBoardId = data.planBoard.planBoardId;
    newLike.value.planBoardId = data.planBoard.planBoardId;

    planBoardObject.value.planBoard = data.planBoard;
    planBoardObject.value.commentList = data.commentList;
    planBoardObject.value.likeList = data.likeList;
    planBoardObject.value.tagList = data.tagList;
    if (!planBoardObject.value.planBoard.thumbnail.startsWith("http")) {
      planBoardObject.value.planBoard.thumbnail =
        "http://localhost/products/" + planBoardObject.value.planBoard.thumbnail;
    }
    const like = planBoardObject.value.likeList.find((like) => like.memberId === memberId.value);
    if (like) {
      // 로그인 상태의 유저가 해당 게시글에 좋아요를 누른 상태
      isClickedLike.value = like;
    } else {
      isClickedLike.value = null;
    }
  });
};

/* Comment */
const addComment = () => {
  local
    .post(`/shareplan/insert/${newComment.value.planBoardId}/comment`, newComment.value)
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

/* Like */
const clickLike = () => {
  console.log(isClickedLike.value);
  if (isClickedLike.value == null) {
    console.log("qwe");
    console.log(newLike.value);
    local
      .post(`/shareplan/insert/${newLike.value.planBoardId}/like`, newLike.value)
      .then(({ data }) => {
        console.log(data);
        getDetail();
      });
  } else {
    local.delete(`/shareplan/like/${isClickedLike.value.planLikeId}`).then(({ data }) => {
      console.log(data);
      getDetail();
    });
  }
};
</script>

<template>
  <div class="container">
    <!-- Main Section -->
    <div class="row mx-5">
      <!-- Title -->
      <h3 class="header">{{ planBoardObject.planBoard.subject }}</h3>
      <hr />
      <!-- Register Time -->
      <div class="register-time">
        {{ planBoardObject.planBoard.registerTime }}
      </div>
      <!-- Section 1 -->
      <div class="col-md-6">
        <!-- Thumbnail -->
        <img
          id="thumbnail"
          :src="planBoardObject.planBoard.thumbnail"
          class="thumbnail"
          alt="Thumbnail"
        />
      </div>
      <!-- Section 2 -->
      <div class="col-md-6">
        <div class="mb-3">
          <!-- Dates -->
          <div class="d-flex">
            <div class="mb-3">
              <span>시작 날짜</span>
              <input
                class="date-input"
                type="text"
                v-model="planBoardObject.planBoard.startDate"
                readonly
              />
            </div>
            <div>
              <span>종료 날짜</span>
              <input
                class="date-input"
                type="text"
                v-model="planBoardObject.planBoard.endDate"
                readonly
              />
            </div>
          </div>
          <!-- 동행인 수 -->
          <div>동반인 수: {{ planBoardObject.planBoard.theNumberOfMembers }}</div>
          <!-- Content -->
          <div class="content-box" v-html="planBoardObject.planBoard.content"></div>
        </div>
      </div>
    </div>
    <!-- Like Section -->
    <div class="like-section">
      <button @click="clickLike" class="like-button">
        <img v-show="isClickedLike" src="@/assets/img/like-on.png" class="like-icon" alt="Liked" />
        <img v-show="!isClickedLike" src="@/assets/img/like-off.png" class="like-icon" alt="Like" />
        <span> {{ planBoardObject.likeList.length }}</span>
      </button>
    </div>
    <!-- Tag Section -->
    <div class="tag-section">
      <button v-for="tag in planBoardObject.tagList" :key="tag.planBoardTagId" class="tag-btn">
        #{{ tag.name }}
      </button>
    </div>
    <!-- Modify Plan Board Article -->
    <button class="btn btn-primary margin-left-auto">
      <router-link
        :to="{
          name: 'share-plan-modify',
          params: { id: planBoardObject.planBoard.planBoardId },
        }"
        class="text-white"
        >게시글 수정하기</router-link
      >
    </button>
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
        <button @click="addComment" class="btn btn-primary mt-2">댓글 달기</button>
      </div>
      <div class="comment-list mt-4">
        <div v-for="comment in planBoardObject.commentList" :key="comment.id" class="comment-item">
          <!-- Existing Comments -->
          <template v-if="comment.deleted == 0">
            <div v-if="editingComment !== comment.commentId">
              <p>작성자: {{ comment.nickname }}</p>
              <p>{{ comment.registerTime }}</p>
              <p>{{ comment.content }}</p>
              <div class="comment-actions">
                <button @click="replyToComment(comment.commentId)" class="btn btn-secondary btn-sm">
                  답글 달기
                </button>
                <button @click="startEditingComment(comment)" class="btn btn-warning btn-sm">
                  수정
                </button>
                <button @click="deleteComment(comment.commentId)" class="btn btn-danger btn-sm">
                  삭제
                </button>
              </div>
            </div>
            <div v-else>
              <textarea v-model="updateComment.content" class="form-control" rows="2"></textarea>
              <button @click="saveEditComment(comment.commentId)" class="btn btn-primary mt-2">
                저장
              </button>
            </div>
          </template>
          <!-- Deleted Comments -->
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
/* Header */
.header {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

/* Thumbnail */
.thumbnail {
  width: 100%;
  height: auto;
}

/* Content Box */
.content-box {
  background-color: #f0f0f0;
  min-height: 200px;
  padding: 15px;
  border-radius: 10px;
}

/* Like Section */
.like-section {
  text-align: center;
  margin-top: 20px;
}

.like-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.like-icon {
  width: 25px;
  height: auto;
  margin-right: 5px;
}

/* Tag Section */
.tag-section {
  text-align: center;
  margin-top: 20px;
}

.tag-btn {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 5px 15px;
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}

/* Comment Section */
.comment-section {
  margin-top: 20px;
}

.comment-form textarea {
  width: 100%;
  resize: vertical;
}

.comment-item {
  border-bottom: 1px solid #ddd;
  padding: 15px 0;
}

.comment-actions button {
  margin-right: 10px;
}

@media (max-width: 768px) {
  .header {
    font-size: 1.5rem;
  }
}
</style>
