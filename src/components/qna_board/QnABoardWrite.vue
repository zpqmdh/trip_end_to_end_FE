<script setup>
import { onMounted, ref, watch } from "vue";
import { localAxios } from "@/util/http-commons.js";
import { useRouter } from "vue-router";
import { decodedTokenFunc } from "@/util/auth";
import Swal from "sweetalert2";

const local = localAxios();
const router = useRouter();

onMounted(() => {
  getMember();
});

const member = ref({
  memberId: "",
  id: "",
  nickname: "",
});
// 게시글 세부 정보
const qnaBoardDto = ref({
  memberId: "",
  subject: "",
  content: "",
  secret: "0",
  password: "",
});
// 비밀글 여부 판단하는 boolean 변수
const isSecretBoolean = ref(qnaBoardDto.value.secret === "1");

// 로그인한 유저 정보 가져오기
const getMember = () => {
  const loginedId = decodedTokenFunc();
  local.get(`/members/detail/${loginedId}`).then(({ data }) => {
    member.value.memberId = data.memberId;
    member.value.nickname = data.nickname;
  });
};

const insertArticle = () => {
  // isSecretBoolean 값에 따라 1, 0 대입
  qnaBoardDto.value.secret = isSecretBoolean.value ? "1" : "0";
  qnaBoardDto.value.memberId = member.value.memberId;

  if (isSecretBoolean.value && !/^\d{4}$/.test(qnaBoardDto.value.password)) {
    Swal.fire({
      icon: "error",
      text: "게시글 비밀번호는 4자리 숫자로 설정해주세요.",
    });
    return;
  }

  local.post("/qna/insert", qnaBoardDto.value).then(() => {
    Swal.fire({
      icon: "success",
      text: "게시글이 등록되었습니다.",
    });
    router.push({ name: "qna-list" });
  });
};

const resetInput = () => {
  qnaBoardDto.value.subject = "";
  qnaBoardDto.value.content = "";
  qnaBoardDto.value.secret = "0";
  qnaBoardDto.value.password = "";
  isSecretBoolean.value = false;
};

// 비밀글 해제시 비밀번호 필드 초기화
watch(isSecretBoolean, (newVal) => {
  if (!newVal) {
    qnaBoardDto.value.password = "";
  }
});
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <!-- 헤더 -->
      <div class="col-lg-8 col-md-10 col-sm-12">
        <h2 class="my-3 py-3 text-center">❓ 문의 게시글</h2>
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
            v-model="qnaBoardDto.subject"
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
            v-model="qnaBoardDto.content"
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
            v-model="qnaBoardDto.password"
          />
        </div>
        <div class="col-auto text-center">
          <button
            type="button"
            id="btn-register"
            class="btn"
            @click="insertArticle"
          >
            등록하기
          </button>
          <button id="btn-reset" type="reset" class="btn" @click="resetInput">
            초기화
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#title {
  margin: 35px 0px;
}
#btn-register {
  border-color: #577b8d;
  color: #577b8d;
  background-color: white;
  margin-right: 10px;
}
#btn-register:hover {
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
