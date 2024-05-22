<script setup>
import { ref, onMounted } from "vue";
import { GoogleMap, Marker } from "vue3-google-map";
import { useRoute, useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons.js";
import { decodedTokenFunc } from "@/util/auth";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

const { VITE_LOCALHOST_URL } = import.meta.env;

const route = useRoute();
const router = useRouter();
const local = localAxios();

const { VITE_GOOGLE_MAP_KEY } = import.meta.env;
const center = { lat: 36.355387, lng: 127.29964 };
const zoom = ref(13);
const mapRef = ref(null);
const locations = ref([]);

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
        `http://${VITE_LOCALHOST_URL}/products/` +
        planBoardObject.value.planBoard.thumbnail;
    }
    const like = planBoardObject.value.likeList.find(
      (like) => like.memberId === memberId.value
    );
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
    .post(
      `/shareplan/insert/${newComment.value.planBoardId}/comment`,
      newComment.value
    )
    .then(() => {
      getDetail();
      newComment.value.content = "";
    });
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
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success mx-3",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });
  swalWithBootstrapButtons
    .fire({
      title: "정말 삭제하실 건가요??",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "예",
      cancelButtonText: "아니오",
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        local.delete(`/shareplan/comment/${commentId}`).then(() => {
          swalWithBootstrapButtons.fire({
            title: "삭제 완료",
            icon: "success",
          });
          getDetail();
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
          title: "취소되었습니다.",
          icon: "error",
        });
      }
    });
};

/* Like */
const clickLike = () => {
  console.log(isClickedLike.value);
  if (isClickedLike.value == null) {
    console.log("qwe");
    console.log(newLike.value);
    local
      .post(
        `/shareplan/insert/${newLike.value.planBoardId}/like`,
        newLike.value
      )
      .then(({ data }) => {
        console.log(data);
        getDetail();
      });
  } else {
    local
      .delete(`/shareplan/like/${isClickedLike.value.planLikeId}`)
      .then(({ data }) => {
        console.log(data);
        getDetail();
      });
  }
};

const moveList = () => {
  router.push({ name: "share-plan-list" });
};
const moveModify = () => {
  router.push({
    name: "share-plan-modify",
    params: { id: planBoardObject.value.planBoard.planBoardId },
  });
};
const deleteArticle = () => {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success mx-3",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });
  swalWithBootstrapButtons
    .fire({
      title: "정말 삭제하실 건가요??",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "예",
      cancelButtonText: "아니오",
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        local
          .delete(`/shareplan/${planBoardObject.value.planBoard.planBoardId}`)
          .then(({ data }) => {
            swalWithBootstrapButtons.fire({
              title: "삭제 완료",
              icon: "success",
            });
            router.push({ name: "share-plan-list" });
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
          title: "취소되었습니다.",
          icon: "error",
        });
      }
    });
};
</script>

<template>
  <div class="container">
    <!-- Main Section -->
    <div class="row mx-5">
      <!-- Title -->
      <h3 class="header">{{ planBoardObject.planBoard.subject }}</h3>
      <hr />
      <!-- Sub-Title -->
      <div class="sub-header">
        <!-- Register Time -->
        <div>📆 {{ planBoardObject.planBoard.registerTime }}</div>
        <!-- hit -->
        <div>👀 {{ planBoardObject.planBoard.hit }}</div>
      </div>

      <!-- Section 1 -->
      <div class="col-md-6">
        <!-- Map Section -->
        <div>
          <GoogleMap
            ref="mapRef"
            :api-key="VITE_GOOGLE_MAP_KEY"
            style="height: 800px"
            :center="center"
            :zoom="zoom"
          >
            <Marker
              v-for="location in locations"
              :options="{
                position: {
                  lat: parseFloat(location.latitude),
                  lng: parseFloat(location.longitude),
                },
              }"
              :key="location.contentId"
              @click="showDetail(location)"
            />
          </GoogleMap>
        </div>
      </div>
      <!-- Section 2 -->
      <div class="col-md-6">
        <div class="mb-3">
          <!-- Thumbnail -->
          <img
            id="thumbnail"
            :src="planBoardObject.planBoard.thumbnail"
            class="thumbnail"
            alt="Thumbnail"
          />
          <!-- Dates -->
          <div class="d-flex justify-content-around mb-3">
            <div>
              <label>🗓️ 시작 날짜</label>
              <input
                class="form-control"
                type="text"
                v-model="planBoardObject.planBoard.startDate"
                readonly
              />
            </div>
            <div>
              <label>🗓️ 종료 날짜</label>
              <input
                class="form-control"
                type="text"
                v-model="planBoardObject.planBoard.endDate"
                readonly
              />
            </div>
          </div>
          <!-- 동행인 수 -->
          <div>
            👥 동반인 수: {{ planBoardObject.planBoard.theNumberOfMembers }}
          </div>
          <!-- Content -->
          <div
            class="content-box"
            v-html="planBoardObject.planBoard.content"
          ></div>
        </div>
      </div>
    </div>
    <!-- Like Section -->
    <div class="like-section">
      <button @click="clickLike" class="like-button">
        <img
          v-show="isClickedLike"
          src="@/assets/img/like-on.png"
          class="like-icon"
          alt="Liked"
        />
        <img
          v-show="!isClickedLike"
          src="@/assets/img/like-off.png"
          class="like-icon"
          alt="Like"
        />
        <h5>{{ planBoardObject.likeList.length }}</h5>
      </button>
    </div>
    <!-- Tag Section -->
    <div class="tag-section">
      <button
        v-for="tag in planBoardObject.tagList"
        :key="tag.planBoardTagId"
        class="tag-btn"
      >
        #{{ tag.name }}
      </button>
    </div>
    <!-- Modify Plan Board Article -->
    <div class="d-flex justify-content-end">
      <button id="btn-list" class="btn" @click="moveList">목록으로</button>
      <template v-if="planBoardObject.planBoard.memberId === memberId">
        <button id="btn-modify" class="btn" @click="moveModify">
          수정하기
        </button>
        <button id="btn-delete" class="btn" @click="deleteArticle">
          삭제하기
        </button>
      </template>
    </div>

    <hr />
    <!-- Comment Section -->
    <div class="comment-section">
      <h4>댓글</h4>
      <div class="comment-form d-flex justify-content-center">
        <textarea
          v-model="newComment.content"
          placeholder="댓글을 입력하세요..."
          class="form-control"
          rows="3"
        ></textarea>
        <button @click="addComment" class="btn">댓글 달기</button>
      </div>
      <div class="comment-list mt-4">
        <div
          v-for="comment in planBoardObject.commentList"
          :key="comment.id"
          class="comment-item"
        >
          <!-- Existing Comments -->
          <template v-if="comment.deleted == 0">
            <div>
              <p>
                👤 작성자: {{ comment.nickname }} 🕒 {{ comment.registerTime }}
              </p>
            </div>
            <div
              v-if="editingComment !== comment.commentId"
              class="d-flex justify-content-between align-items-center"
            >
              <p>{{ comment.content }}</p>
              <div v-if="comment.memberId === memberId" class="comment-actions">
                <button
                  @click="startEditingComment(comment)"
                  class="btn btn-sm"
                  id="btn-modify"
                >
                  수정
                </button>
                <button
                  @click="deleteComment(comment.commentId)"
                  class="btn btn-sm"
                  id="btn-delete"
                >
                  삭제
                </button>
              </div>
            </div>
            <div v-else class="d-flex justify-content-center">
              <textarea
                v-model="updateComment.content"
                class="form-control"
                style="width: 80%; margin-right: 10px"
                rows="2"
              ></textarea>
              <button
                @click="saveEditComment(comment.commentId)"
                class="btn mt-2"
                id="btn-list"
              >
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

.sub-header {
  text-align: end;
}

#btn-list {
  border-color: #97654c;
  color: #97654c;
  background-color: white;
  margin-right: 5px;
}
#btn-list:hover {
  background-color: #97654c;
  color: white;
}
#btn-modify {
  border-color: #577b8d;
  color: #577b8d;
  background-color: white;
  margin-right: 5px;
}
#btn-modify:hover {
  background-color: #577b8d;
  color: white;
}
#btn-delete {
  border-color: #666;
  color: #666;
  background-color: white;
}
#btn-delete:hover {
  background-color: #666;
  color: white;
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
  width: 40px;
  height: auto;
  margin-right: 5px;
}

/* Tag Section */
.tag-section {
  text-align: center;
  margin-top: 20px;
}

.tag-btn {
  background-color: #577b8d;
  color: white;
  border-color: white;
  border-radius: 20px;
  padding: 5px 15px;
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}
.tag-btn:hover {
  background-color: white;
  color: #577b8d;
  border-color: #577b8d;
}

/* Comment Section */
.comment-section {
  margin-top: 20px;
}

.comment-form textarea {
  width: 80%;
  resize: vertical;
}
.comment-form button {
  margin-left: 10px;
  background-color: #5698ad;
  color: white;
  border-color: white;
}

.comment-list {
  display: flex;
  flex-direction: column; /* Ensures comments are displayed vertically */
  align-items: center;
}

.comment-item {
  border-bottom: 1px solid #ddd;
  padding: 15px 0;
  width: 100%; /* Ensure the comment item takes up full width */
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.comment-actions .btn {
  background-color: #577b8d;
  color: white;
}

.comment-actions .btn:hover {
  background-color: #475f6e;
}
@media (max-width: 768px) {
  .header {
    font-size: 1.5rem;
  }
}
</style>
