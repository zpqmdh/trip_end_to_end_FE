<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons.js";
import { decodedTokenFunc } from "@/util/auth";

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
  // TODO: delete 할건지 물어보기
  local.delete(`/qna/${article.value.qnaBoardDto.qnaBoardId}`).then(({ data }) => {
    router.push({ name: "qna-list" });
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
  local.delete(`/qna/comment/${commentId}`).then(() => {
    getQnADetail(route.params.id);
  });
};
onMounted(() => {
  getQnADetail(route.params.id);
  getMember();
});
</script>
<template>
  <div class="container">
    <!-- Main Section -->
    <div class="main">
      <h2>{{ article.qnaBoardDto.subject }}</h2>
      <div class="meta">
        <span class="author">👤 작성자: {{ author.nickname }}</span>
        <span class="divider">|</span>
        <span class="views">👁 조회수: {{ article.qnaBoardDto.hit }}</span>
        <span class="divider">|</span>
        <span class="time">🕒 {{ article.qnaBoardDto.registerTime }}</span>
      </div>
      <div class="content">{{ article.qnaBoardDto.content }}</div>
      <template v-if="author.memberId === member.memberId">
        <button @click.prevent="deleteArticle">삭제</button>
      </template>
    </div>
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
            <div v-if="editingComment !== comment.commentId">
              <p>작성자: {{ comment.nickname }}</p>
              <p>{{ comment.registerTime }}</p>
              <p>{{ comment.content }}</p>
              <div class="comment-actions">
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
  <hr />
</template>
<style scoped>
.container {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

hr {
  border: none;
  border-top: 1px solid #ccc;
  margin-bottom: 20px;
}

.meta {
  margin-bottom: 20px;
}
.divider {
  color: #999;
}

.content {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}
</style>
