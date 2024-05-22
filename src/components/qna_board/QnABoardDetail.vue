<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons.js";
import { decodedTokenFunc } from "@/util/auth";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

const route = useRoute();
const router = useRouter();
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
    newComment.value.memberId = data.memberId;
  });
};

const getAuthor = () => {
  local.get(`/plans/getMember/${article.value.qnaBoardDto.memberId}`).then(({ data }) => {
    author.value = data;
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
        local.delete(`/qna/${article.value.qnaBoardDto.qnaBoardId}`).then(({ data }) => {
          swalWithBootstrapButtons.fire({
            title: "삭제 완료",
            icon: "success",
          });
          router.push({ name: "qna-list" });
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
          title: "취소되었습니다.",
          icon: "error",
        });
      }
    });
};

const newComment = ref({
  qnaBoardId: route.params.id,
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

const addComment = () => {
  local
    .post(`/qna/insert/${newComment.value.qnaBoardId}/comment`, newComment.value)
    .then(({ data }) => {
      console.log(data);
      getQnADetail(route.params.id);
      newComment.value.content = "";
    });
};

const startEditingComment = (comment) => {
  editingComment.value = comment.commentId;
  updateComment.value.commentId = comment.commentId;
  updateComment.value.content = comment.content;
};

const saveEditComment = (commentId) => {
  local.put(`/qna/comment/${commentId}`, updateComment.value).then(() => {
    getQnADetail(route.params.id);
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
        local.delete(`/qna/comment/${commentId}`).then(() => {
          swalWithBootstrapButtons.fire({
            title: "삭제 완료",
            icon: "success",
          });
          getQnADetail(route.params.id);
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
          title: "취소되었습니다.",
          icon: "error",
        });
      }
    });
};

onMounted(() => {
  getQnADetail(route.params.id);
  getMember();
});

const mvList = () => {
  router.push({ name: "qna-list" });
};

const mvModify = () => {
  router.push({ name: "qna-modify", params: { id: article.value.qnaBoardDto.qnaBoardId } });
};
</script>

<template>
  <div class="d-flex justify-content-center mt-3">
    <h1>❓ 문의 게시판</h1>
  </div>
  <div class="container" id="main">
    <!-- Main Section -->
    <div class="d-flex justify-content-center">
      <h2>{{ article.qnaBoardDto.subject }}</h2>
    </div>
    <hr />

    <div class="meta">
      <span class="author">👤 작성자: {{ author.nickname }}</span>
      <span class="divider">|</span>
      <span class="views">👁 조회수: {{ article.qnaBoardDto.hit }}</span>
      <span class="divider">|</span>
      <span class="time">🕒 {{ article.qnaBoardDto.registerTime }}</span>
    </div>
    <div class="content">{{ article.qnaBoardDto.content }}</div>
    <div class="col-auto text-end">
      <button id="btn-list" type="button" class="btn mb-3" @click="mvList">목록으로</button>
      <template v-if="author.memberId === member.memberId">
        <button id="btn-modify" type="button" class="btn mb-3" @click="mvModify">수정하기</button>
        <button id="btn-delete" type="button" class="btn mb-3" @click.prevent="deleteArticle">
          삭제하기
        </button>
      </template>
    </div>
  </div>
  <div class="container">
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
        <div v-for="comment in article.commentList" :key="comment.id" class="comment-item">
          <!-- Existing Comments -->
          <template v-if="comment.deleted == 0">
            <div>
              <p>👤 작성자: {{ comment.nickname }} 🕒 {{ comment.registerTime }}</p>
            </div>
            <div
              v-if="editingComment !== comment.commentId"
              class="d-flex justify-content-between align-items-center"
            >
              <p>{{ comment.content }}</p>
              <div v-if="comment.memberId === member.memberId" class="comment-actions">
                <button @click="startEditingComment(comment)" class="btn btn-sm" id="btn-modify">
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
              <button @click="saveEditComment(comment.commentId)" class="btn mt-2" id="btn-list">
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
.container {
  margin-top: 20px;
  padding: 20px;
  border-radius: 5px;
}

/* Styling for the main container */
#main {
  border: 1px solid #ccc;
}

#main h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

#main .meta {
  margin-bottom: 20px;
  text-align: end;
  font-size: 16px;
}

#main .author,
.views,
.time {
  margin-right: 10px;
  color: #666;
}

#main .divider {
  color: #999;
}

#main .content {
  font-size: 20px;
  line-height: 1.6;
  margin-bottom: 20px;
  padding-left: 100px;
  padding-right: 100px;
  padding-top: 30px;
}

/* Styling for the rest of the containers */
.container h2 {
  font-size: 20px;
}

.container .meta {
  margin-bottom: 15px;
}

.container .content {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 15px;
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

/* Comment Section */
.comment-section {
  margin-top: 20px;
}

.comment-form {
  display: flex;
  justify-content: center;
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
  flex-direction: column;
  width: 100%;
}

.comment-item {
  border-bottom: 1px solid #ddd;
  padding: 15px 0;
  width: 100%;
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

.d-flex.align-items-center {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
