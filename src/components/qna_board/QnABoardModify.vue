<script setup>
import { ref, onMounted, watch } from "vue";
import { localAxios } from "@/util/http-commons.js";
import { useRoute, useRouter } from "vue-router";
import { decodedTokenFunc } from "@/util/auth";
import Swal from "sweetalert2";

const local = localAxios();
const route = useRoute();
const router = useRouter();

// 게시글 정보
const article = ref({
  qnaBoardDto: {},
  commentList: [],
});

// 비밀글 여부 판단하는 boolean 변수
const isSecretBoolean = ref(false);

onMounted(() => {
  getDetail(route.params.id);
});

// 게시글 정보 가져오기
const getDetail = (id) => {
  local.get("/qna/" + id).then(({ data }) => {
    article.value = data.article;
    isSecretBoolean.value = article.value.qnaBoardDto.secret === "1";
    getMember(); // 수정 권한 확인
  });
};

const getMember = () => {
  const loginedId = decodedTokenFunc();
  local.get(`/members/detail/${loginedId}`).then(({ data }) => {
    // 로그인한 유저가 게시글 수정 권한 있는지 확인
    if (data.memberId != article.value.qnaBoardDto.memberId) {
      Swal.fire({
        icon: "error",
        text: "게시글 수정 권한이 없습니다.",
      });
      router.replace({ name: "qna-list" });
    }
  });
};

const updateArticle = () => {
  const id = route.params.id;
  article.value.qnaBoardDto.secret = isSecretBoolean.value ? "1" : "0";

  // 비밀글 설정 && 입력한 비밀번호가 4글자 숫자로만 이루어져 있지 않음
  if (
    isSecretBoolean.value &&
    !/^\d{4}$/.test(article.value.qnaBoardDto.password)
  ) {
    Swal.fire({
      icon: "error",
      text: "게시글 비밀번호는 4자리 숫자로 설정해주세요.",
    });
    return;
  }

  local
    .put("/qna/" + id, article.value.qnaBoardDto)
    .then(() => {
      Swal.fire({
        icon: "success",
        text: "해당 게시글이 수정되었습니다.",
      });
      router.replace({ name: "qna-list" });
    })
    .catch(() => {
      Swal.fire({
        icon: "error",
        text: "게시글 수정에 실패하였습니다.",
      });
    });
};

const resetInput = () => {
  article.value.qnaBoardDto = {};
};

// secret 여부에 따라 isSecretBoolean 값 변경
watch(
  () => article.value.qnaBoardDto.secret,
  (newVal) => {
    isSecretBoolean.value = newVal === "1";
  }
);

// isSecretBoolean이 false라면 비밀번호 필드 초기화
watch(isSecretBoolean, (newVal) => {
  if (!newVal) {
    article.value.qnaBoardDto.password = "";
  }
});
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <!-- 헤더 -->
      <div class="d-flex justify-content-center mt-3">
        <h1>❓ 문의 게시판</h1>
      </div>
      <div class="col-lg-8 col-md-10 col-sm-12">
        <!-- 제목 -->
        <div class="mb-3">
          <label for="subject" class="form-label">제목 : </label>
          <input
            type="text"
            class="form-control"
            id="subject"
            placeholder="제목..."
            required
            v-model="article.qnaBoardDto.subject"
          />
        </div>
        <!-- 내용 -->
        <div class="mb-3">
          <label for="content" class="form-label">내용 : </label>
          <textarea
            class="form-control"
            id="content"
            rows="7"
            required
            placeholder="내용을 입력해주세요 ... "
            v-model="article.qnaBoardDto.content"
          ></textarea>
        </div>
        <!-- 비밀글 여부 판단하는 체크박스 -->
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            v-model="isSecretBoolean"
            id="flexCheckDefault"
          />
          <label class="form-check-label" for="flexCheckDefault">
            비밀글로 등록하기
          </label>
        </div>
        <!-- 비밀글로 설정했을 때 비밀번호 입력창 활성화 -->
        <div class="col-lg-4">
          <input
            type="password"
            class="form-control"
            style="width: 50%; margin-bottom: 10px"
            id="password"
            placeholder="4자리 비밀번호"
            :required="isSecretBoolean"
            :disabled="!isSecretBoolean"
            v-model="article.qnaBoardDto.password"
          />
        </div>
        <div class="col-auto text-center">
          <button
            type="button"
            id="btn-update"
            class="btn mb-3"
            @click="updateArticle"
          >
            등록하기
          </button>
          <button
            id="btn-reset"
            type="reset"
            class="btn mb-3"
            @click="resetInput"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#btn-update {
  border-color: #577b8d;
  color: #577b8d;
  background-color: white;
  margin-right: 5px;
}
#btn-update:hover {
  background-color: #577b8d;
  color: white;
}
#btn-reset {
  border-color: #97654c;
  color: #97654c;
  background-color: white;
}
#btn-reset:hover {
  background-color: #97654c;
  color: white;
}
</style>
