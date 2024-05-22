<script setup>
import { ref, computed, onMounted } from "vue";
import { localAxios } from "@/util/http-commons.js";
import { useRoute, useRouter } from "vue-router";
import { decodedTokenFunc } from "@/util/auth";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

const local = localAxios();
const route = useRoute();
const router = useRouter();

const notice = ref({
  subject: "",
  content: "",
  isFixed: 0, // 초기값 설정
});

onMounted(() => {
  getMember(); // 수정 권한 확인
  getDetail(route.params.id);
});

const getMember = () => {
  const loginedId = decodedTokenFunc();
  local.get(`/members/detail/${loginedId}`).then(({ data }) => {
    // 관리자 아님 -> 수정 권한 없음
    if (data.type != 3) {
      Swal.fire({
        icon: "error",
        text: "공지사항 수정은 관리자만 할 수 있습니다.",
      });
      router.push({ name: "notice-list" });
    }
  });
};

const getDetail = (id) => {
  local.get("/notice/" + id).then(({ data }) => {
    notice.value = data;
    console.log(notice.value);
  });
};

const updateArticle = () => {
  const id = notice.value.noticeBoardId;
  local.put("/notice/" + id, notice.value).then(({ data }) => {
    Swal.fire({
      icon: "success",
      text: "공지사항이 수정되었습니다.",
    });
    router.push({
      name: "notice-detail",
      params: { id: notice.value.noticeBoardId },
    });
  });
};

const isFixedBoolean = computed({
  get() {
    return notice.value.isFixed === "1";
  },
  set(value) {
    notice.value.isFixed = value ? "1" : "0";
  },
});

const resetInput = () => {
  notice.value.subject = "";
  notice.value.content = "";
  notice.value.isFixed = 0;
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
            v-model="notice.subject"
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
            v-model="notice.content"
          ></textarea>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" v-model="isFixedBoolean" id="isFixed" />
          <label class="form-check-label" for="isFixed">고정하기</label>
        </div>
        <div class="col-auto text-center">
          <button type="button" id="btn-update" class="btn mb-3" @click="updateArticle">
            등록하기
          </button>
          <button id="btn-reset" type="reset" class="btn mb-3" @click="resetInput">초기화</button>
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
