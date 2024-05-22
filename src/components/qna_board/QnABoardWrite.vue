<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { localAxios } from "@/util/http-commons.js";
import { useRouter } from "vue-router";
import { decodedTokenFunc } from "@/util/auth";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

const local = localAxios();
const router = useRouter();

onMounted(() => {
  getMemberId();
});

let member = ref({
  memberId: "",
  id: "",
  nickname: "",
});
const getMemberId = () => {
  const loginedId = decodedTokenFunc();
  local.get(`/members/detail/${loginedId}`).then(({ data }) => {
    member.value.memberId = data.memberId;
    member.value.nickname = data.nickname;
  });
};

const qnaBoardDto = ref({
  memberId: "",
  subject: "",
  content: "",
  secret: "0",
  password: "",
});

const insertArticle = () => {
  qnaBoardDto.value.secret = isSecretBoolean ? 1 : 0;
  qnaBoardDto.value.memberId = member.value.memberId;
  if (isSecretBoolean && !/^\d{4}$/.test(qnaBoardDto.value.password)) {
    Swal.fire({
      icon: "error",
      text: "게시글 비밀번호는 4자리로 설정해주세요.",
    });
    return;
  }
  local.post("/qna/insert", qnaBoardDto.value).then(({ data }) => {
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
  qnaBoardDto.value.secret = false;
  qnaBoardDto.value.password = "";
};

const isSecretBoolean = computed({
  get() {
    return qnaBoardDto.value.secret === "1";
  },
  set(value) {
    qnaBoardDto.value.secret = value ? "1" : "0";
  },
});
watch(isSecretBoolean, (newVal) => {
  if (!newVal) {
    qnaBoardDto.value.password = "";
  }
});
</script>
<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-8 col-md-10 col-sm-12">
        <h2 class="my-3 py-3 text-center">문의 게시글</h2>
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
            v-model="qnaBoardDto.subject"
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
            v-model="qnaBoardDto.content"
          ></textarea>
        </div>
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            v-model="isSecretBoolean"
            id="flexCheckDefault"
          />
          <label class="form-check-label" for="flexCheckDefault"> 비밀글로 등록하기 </label>
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
            :value="qnaBoardDto.password"
            v-model="qnaBoardDto.password"
          />
        </div>
        <div class="col-auto text-center">
          <button
            type="button"
            id="btn-register"
            class="btn btn-outline-primary mb-3"
            @click="insertArticle"
          >
            등록하기
          </button>
          <button type="reset" class="btn btn-outline-danger mb-3" @click="resetInput">
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
</style>
