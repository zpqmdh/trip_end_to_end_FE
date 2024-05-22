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
    // 관리자 아님 -> 작성 권한 없음
    if (data.type != 3) {
      alert("공지사항 작성 권한이 없습니다.");
      router.push({ name: "notice-list" });
    }
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
  noticeBoardDto.value.isFixed = noticeBoardDto.value.isFixed ? 1 : 0;
  local.post("/notice/insert", noticeBoardDto.value).then(({ data }) => {
    console.log(data);
    router.push({ name: "notice-list" });
  });
};
</script>
<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="d-flex justify-content-center mt-3">
        <h1>📢 공지사항</h1>
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
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            v-model="noticeBoardDto.isFixed"
            id="isFixed"
          />
          <label class="form-check-label" for="isFixed"> 고정하기 </label>
        </div>
        <div class="col-auto text-center">
          <button type="button" id="btn-register" class="btn mb-3" @click="insertArticle">
            등록하기
          </button>
          <button id="btn-reset" type="reset" class="btn mb-3" @click="resetInput">초기화</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
#btn-register {
  border-color: #577b8d;
  color: #577b8d;
  background-color: white;
  margin-right: 5px;
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
