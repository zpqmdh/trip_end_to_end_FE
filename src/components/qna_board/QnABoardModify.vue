<script setup>
import { ref, onMounted, watch } from "vue";
import { localAxios } from "@/util/http-commons.js";
import { useRoute, useRouter } from "vue-router";
import { decodedTokenFunc } from "@/util/auth";
import Swal from "sweetalert2";

const local = localAxios();
const route = useRoute();
const router = useRouter();

const article = ref({
  qnaBoardDto: {},
  commentList: [],
});

const isSecretBoolean = ref(false);

onMounted(() => {
  getDetail(route.params.id);
});

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

watch(
  () => article.value.qnaBoardDto.secret,
  (newVal) => {
    isSecretBoolean.value = newVal === "1";
  }
);

watch(isSecretBoolean, (newVal) => {
  if (!newVal) {
    article.value.qnaBoardDto.password = "";
  }
});
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="d-flex justify-content-center mt-3">
        <h1>❓ 문의 게시판</h1>
      </div>
      <div class="col-lg-8 col-md-10 col-sm-12">
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
