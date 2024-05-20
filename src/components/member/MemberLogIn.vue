<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons";
import { login } from "@/util/auth";

const local = localAxios();

const router = useRouter();
const loginMember = ref({
  id: "",
  password: "",
});

const handleLogin = async () => {
  try {
    const response = await local.post("/members/login", loginMember.value);
    const { accessToken, refreshToken } = response.data;

    // 토큰 저장 (localStorage)
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    // 로그인 상태 변경
    login();

    // 메인 화면으로 라우팅
    router.push({ name: "main" });
  } catch (error) {
    if (error.response && error.response.status === 403) {
      alert("탈퇴된 아이디입니다.");
    } else {
      alert("로그인에 실패하였습니다.");
    }
    console.error("로그인에 실패하였습니다.", error);
  }
};

const handleFindPassword = async () => {
  // 비밀번호 변경
  router.push({ name: "member-findpassword" });
};

const handleMoveToSignup = async () => {
  router.push({ name: "member-signup" });
};
</script>

<template>
  <div class="login-page">
    <form @submit.prevent="handleLogin" class="login-form">
      <h2 class="login-title">로그인</h2>
      <div class="form-group">
        <label for="id" class="mb-2">아이디</label>
        <input
          v-model="loginMember.id"
          type="text"
          id="id"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="password" class="mb-2">비밀번호</label>
        <input
          v-model="loginMember.password"
          type="password"
          id="password"
          class="form-control"
          required
        />
      </div>
      <button type="submit" class="btn btn-primary">로그인</button>
      <div class="links">
        <p class="forgot-password">비밀번호를 잊으셨나요?</p>
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleFindPassword"
        >
          비밀번호 찾기
        </button>
      </div>
      <div class="signup-link">
        계정이 없다면 <a href="#" @click="handleMoveToSignup">회원가입</a> 후
        로그인해주세요.
      </div>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 93.8vh;
  background-color: #b5ccce;
}

.login-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 500px;
  height: 500px;
  text-align: center;
  align-content: center;
}

.login-title {
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
