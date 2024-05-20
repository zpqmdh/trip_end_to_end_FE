<script setup>
import { onMounted, ref } from "vue";
import { localAxios } from "@/util/http-commons.js";
import { useRouter } from "vue-router";
import { decodedTokenFunc } from "@/util/auth";

const local = localAxios();
const router = useRouter();
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
const noticeBoardDto = ref({
  memberId: "",
  subject: "",
  content: "",
  secret: false,
  password: "",
});
onMounted(() => {
  getMemberId();
});
const insertArticle = () => {
  noticeBoardDto.value.memberId = member.value.memberId;
  local.post("/notice/insert", noticeBoardDto.value).then(({ data }) => {
    console.log(data);
    router.push({ name: "notice-list" });
  });
};
</script>
<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-8 col-md-10 col-sm-12">
        <h2 class="my-3 py-3 text-center">공지사항</h2>
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
            v-model="noticeBoardDto.subject"
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
            v-model="noticeBoardDto.content"
          ></textarea>
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
          <button
            type="reset"
            class="btn btn-outline-danger mb-3"
            @click="resetInput"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
