<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

const local = localAxios();

const router = useRouter();
const loginMember = ref({
  id: "",
  password: "",
});
const findComplete = ref("");

const handleFindPassword = async () => {
  findComplete.value = "회원님의 이메일로 비밀번호 설정 링크가 발송되었습니다!";
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
          <input v-model="loginMember.id" type="text" id="id" class="form-control" required />
        </div>
        <div class="form-group">
          <label for="email" class="mb-2">이메일</label>
          <input
            v-model="loginMember.password"
            type="password"
            id="password"
            class="form-control"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary" @click="handleFindPassword">
          비밀번호 찾기
        </button>
      </div>
      <div v-if="findComplete">
        {{ findComplete }}
      </div>
      <div class="links">
        <button type="button" class="btn btn-secondary" @click="handleMoveToLogin">
          로그인 페이지로
        </button>
        <button type="button" class="btn btn-secondary" @click="handleMoveToSignup">
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
</style>
