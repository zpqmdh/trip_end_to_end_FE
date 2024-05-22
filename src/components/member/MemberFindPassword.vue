<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

const local = localAxios();

const router = useRouter();
const findMember = ref({
  id: "",
  emailId: "",
  emailDomain: "",
});
const findComplete = ref("");

const handleFindPassword = async () => {
  local.get(`/members/detail/${findMember.value.id}`).then(({ member }) => {
    if (
      member.emailId === findMember.value.emailId &&
      member.emailDomain === findMember.value.emailDomain
    ) {
      findComplete.value =
        "회원님의 이메일로 비밀번호 설정 링크가 발송되었습니다!";
    } else {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-success mx-3",
          cancelButton: "btn btn-danger",
        },
        buttonsStyling: false,
      });
      swalWithBootstrapButtons.fire({
        title: "해당하는 회원 정보가 없습니다.",
        icon: "error",
      });
    }
  });
};

const handleMoveToLogin = async () => {
  // 비밀번호 변경
  router.push({ name: "member-login" });
};

const handleMoveToSignup = async () => {
  router.push({ name: "member-signup" });
};
</script>

<template>
  <div class="find-password-page">
    <form @submit.prevent="handleFindPassword" class="find-password-form">
      <div v-if="!findComplete">
        <h2 class="find-password-title">비밀번호 찾기</h2>
        <div class="form-group">
          <label for="id" class="mb-2">아이디</label>
          <input
            v-model="findMember.id"
            type="text"
            class="form-control"
            required
          />
        </div>
        <div class="form-group">
          <label for="emailId" class="mb-2">이메일</label>
          <div class="email">
            <input
              v-model="findMember.emailId"
              type="text"
              class="form-control"
              style="margin-right: 10px"
              required
            />
            <p class="mt-2">@</p>
            <input
              v-model="findMember.emailDomain"
              type="text"
              class="form-control"
              style="margin-left: 10px"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          class="btn btn-primary"
          @click="handleFindPassword"
        >
          비밀번호 찾기
        </button>
      </div>
      <div v-if="findComplete">
        {{ findComplete }}
      </div>
      <div class="links">
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleMoveToLogin"
        >
          로그인 페이지로
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleMoveToSignup"
        >
          회원가입 페이지로
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.find-password-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 93.8vh;
  background-color: #b5ccce;
}

.find-password-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 500px;
  height: 500px;
  text-align: center;
  align-content: center;
}

.find-password-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
}

.form-group {
  margin-bottom: 15px;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.btn-primary {
  background-color: #000;
  color: #fff;
}

.btn-secondary {
  background-color: #e9ecef;
  color: #495057;
  margin-top: 10px;
}

.links {
  margin-top: 15px;
}

.forgot-password {
  display: block;
  margin-bottom: 10px;
  color: #6c757d;
}

.signup-link {
  margin-top: 20px;
  color: #6c757d;
}

.signup-link a {
  color: #007bff;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}

.email {
  margin-bottom: 30px;
  display: flex;
  height: 45px;
}
</style>
