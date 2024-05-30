<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons.js";
import { decodedTokenFunc } from "@/util/auth";
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();
const local = localAxios();

// 게시글 세부 정보 ref 객체
const article = ref({
  qnaBoardDto: {}, // 게시글 정보
  commentList: [], // 게시글에 달린 댓글 목록
});
// 로그인한 유저 ref 객체
const member = ref({});
// 게시글 작성자 정보 ref 객체
const author = ref({});
// 댓글 작성 폼 ref 객체
const newComment = ref({
  qnaBoardId: route.params.id,
  memberId: "",
  content: "",
  depth: "-1",
  commentGroup: "-1",
});
// 현재 편집 중인 댓글의 ID
const editingComment = ref(null);
// 수정할 댓글 ref 객체
const updateComment = ref({
  commentId: -1,
  content: "",
});

// 문의 게시글 세부 정보 가져오기
const getQnADetail = (id) => {
  local.get("/qna/" + id).then(({ data }) => {
    article.value = data.article;
    article.value.commentList.forEach((comment) => {
      comment.content = comment.content.replaceAll(/(\n|\r\n)/g, "<br>"); // 개행 <br> 태그로 바꿔주기
    });
    getAuthor(); // 게시글 작성자 정보 불러오기
  });
};

// 로그인한 유저 정보 가져오기
const getMember = () => {
  const loginedId = decodedTokenFunc();
  local.get(`/members/detail/${loginedId}`).then(({ data }) => {
    member.value = data;
    newComment.value.memberId = data.memberId; // 댓글 작성자 member 세팅
  });
};

// 게시글 작성자 정보 가져오기
const getAuthor = () => {
  local
    .get(`/plans/getMember/${article.value.qnaBoardDto.memberId}`)
    .then(({ data }) => {
      author.value = data;
    });
};

// 게시글 삭제
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
          .delete(`/qna/${article.value.qnaBoardDto.qnaBoardId}`)
          .then(({ data }) => {
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

// 댓글 새로 등록하기
const addComment = () => {
  local
    .post(
      `/qna/insert/${newComment.value.qnaBoardId}/comment`,
      newComment.value
    )
    .then(({ data }) => {
      getQnADetail(route.params.id); // 새로 게시글 정보 가져오기
      newComment.value.content = ""; // 초기화
    });
};

// 댓글 수정 시작 -> editingComment, updateComment 값 설정
const startEditingComment = (comment) => {
  editingComment.value = comment.commentId;
  updateComment.value.commentId = comment.commentId;
  updateComment.value.content = comment.content;
};

// 등록된 댓글 수정하기
const saveEditComment = (commentId) => {
  local.put(`/qna/comment/${commentId}`, updateComment.value).then(() => {
    getQnADetail(route.params.id);
    editingComment.value = null;
  });
};

// 댓글 삭제하기
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

// 문의 게시글 목록으로 이동
const mvList = () => {
  router.push({ name: "qna-list" });
};

// 문의 게시글 수정 페이지로 이동
const mvModify = () => {
  router.push({
    name: "qna-modify",
    params: { id: article.value.qnaBoardDto.qnaBoardId },
  });
};
</script>

<template>
  <div class="d-flex justify-content-center mt-3">
    <h1>❓ 문의 게시판</h1>
  </div>
  <!-- 게시글 정보 -->
  <div class="container" id="main">
    <!-- 제목 -->
    <div class="d-flex justify-content-center">
      <h2>{{ article.qnaBoardDto.subject }}</h2>
    </div>
    <hr />
    <!-- 부가 정보 -->
    <div class="meta">
      <span class="author">👤 작성자: {{ author.nickname }}</span>
      <span class="divider">|</span>
      <span class="views">👁 조회수: {{ article.qnaBoardDto.hit }}</span>
      <span class="divider">|</span>
      <span class="time">🕒 {{ article.qnaBoardDto.registerTime }}</span>
    </div>
    <!-- 내용 -->
    <div class="content">{{ article.qnaBoardDto.content }}</div>
    <!-- 버튼 -->
    <div class="col-auto text-end">
      <button id="btn-list" type="button" class="btn mb-3" @click="mvList">
        목록으로
      </button>
      <template v-if="author.memberId === member.memberId">
        <button
          id="btn-modify"
          type="button"
          class="btn mb-3"
          @click="mvModify"
        >
          수정하기
        </button>
        <button
          id="btn-delete"
          type="button"
          class="btn mb-3"
          @click.prevent="deleteArticle"
        >
          삭제하기
        </button>
      </template>
    </div>
  </div>
  <!-- 댓글 -->
  <div class="container">
    <div class="comment-section">
      <h4>댓글</h4>
      <!-- 댓글 작성 폼 -->
      <div class="comment-form d-flex justify-content-center">
        <textarea
          v-model="newComment.content"
          placeholder="댓글을 입력하세요..."
          class="form-control"
          rows="3"
        ></textarea>
        <button @click="addComment" class="btn">댓글 달기</button>
      </div>
      <!-- 등록된 댓글 조회 -->
      <div class="comment-list mt-4">
        <div
          v-for="comment in article.commentList"
          :key="comment.id"
          class="comment-item"
        >
          <div>
            <p>
              👤 작성자: {{ comment.nickname }} 🕒 {{ comment.registerTime }}
            </p>
          </div>
          <div
            v-if="editingComment !== comment.commentId"
            class="d-flex justify-content-between align-items-center"
          >
            <div v-html="comment.content"></div>
            <!-- 댓글 작성자와 로그인한 유저가 일치할 때만 -->
            <div
              v-if="comment.memberId === member.memberId"
              class="comment-actions"
            >
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
