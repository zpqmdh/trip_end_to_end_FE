<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons";
import { login } from "@/util/auth";
import Swal from "sweetalert2";

// Axios 인스턴스 생성
const local = localAxios();

// Vue Router 사용을 위한 설정
const router = useRouter();

// 로그인 폼의 데이터 초기값 설정
const loginMember = ref({
  id: "",
  password: "",
});

// 로그인 처리 함수
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
    Swal.fire({
      icon: "success",
      title: "로그인 성공 !",
    });
    router.push({ name: "main" });
  } catch (error) {
    loginMember.value.id = "";
    loginMember.value.password = "";
    if (error.response && error.response.status === 403) {
      Swal.fire({
        icon: "error",
        text: "탈퇴한 아이디입니다.",
      });
    } else {
      Swal.fire({
        icon: "error",
        text: "아이디와 비밀번호가 일치하는 회원이 없습니다.",
      });
    }
    console.error("로그인에 실패하였습니다.", error);
  }
};

// 비밀번호 찾기 페이지로 이동하는 함수
const handleFindPassword = async () => {
  router.push({ name: "member-findpassword" });
};

// 회원가입 페이지로 이동하는 함수
const handleMoveToSignup = async () => {
  router.push({ name: "member-signup" });
};
</script>

<template>
  <div class="login-page">
    <!-- 로그인 폼 -->
    <form @submit.prevent="handleLogin" class="login-form">
      <h2 class="login-title">로그인</h2>
      <!-- 아이디 입력 필드 -->
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
      <!-- 비밀번호 입력 필드 -->
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
      <!-- 로그인 버튼 -->
      <button type="submit" class="btn btn-primary">로그인</button>
      <!-- 비밀번호 찾기 및 회원가입 링크 -->
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
/* 로그인 페이지 스타일 */
.login-page {
  display: flex; /* 중앙 정렬을 위한 플렉스 박스 설정 */
  justify-content: center; /* 수평 중앙 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  height: 93.8vh; /* 전체 높이 설정 */
  background-color: #b5ccce; /* 배경색 설정 */
}

/* 로그인 폼 스타일 */
.login-form {
  background: #fff; /* 배경 흰색 설정 */
  padding: 20px; /* 폼 패딩 설정 */
  border-radius: 8px; /* 테두리 둥글게 설정 */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* 그림자 효과 설정 */
  width: 500px; /* 폼 너비 설정 */
  height: 500px; /* 폼 높이 설정 */
  text-align: center; /* 텍스트 중앙 정렬 */
  align-content: center; /* 내용물 중앙 정렬 */
}

/* 로그인 제목 스타일 */
.login-title {
  margin-bottom: 20px; /* 아래쪽 마진 설정 */
  font-size: 24px; /* 글꼴 크기 설정 */
  font-weight: bold; /* 글꼴 두께 설정 */
}

/* 폼 그룹 스타일 */
.form-group {
  margin-bottom: 15px; /* 아래쪽 마진 설정 */
}

/* 폼 컨트롤 스타일 */
.form-control {
  width: 100%; /* 너비 100% 설정 */
  padding: 10px; /* 패딩 설정 */
  border: 1px solid #ccc; /* 테두리 설정 */
  border-radius: 4px; /* 테두리 둥글게 설정 */
}

/* 버튼 스타일 */
.btn {
  width: 100%; /* 너비 100% 설정 */
  padding: 10px; /* 패딩 설정 */
  border: none; /* 테두리 없음 */
  border-radius: 4px; /* 테두리 둥글게 설정 */
  font-size: 16px; /* 글꼴 크기 설정 */
  cursor: pointer; /* 커서 포인터로 변경 */
}

/* 기본 버튼 스타일 */
.btn-primary {
  background-color: #000; /* 배경색 검정 */
  color: #fff; /* 글자색 흰색 */
}

/* 보조 버튼 스타일 */
.btn-secondary {
  background-color: #e9ecef; /* 배경색 설정 */
  color: #495057; /* 글자색 설정 */
  margin-top: 10px; /* 위쪽 마진 설정 */
}

/* 링크 그룹 스타일 */
.links {
  margin-top: 15px; /* 위쪽 마진 설정 */
}

/* 비밀번호 찾기 링크 스타일 */
.forgot-password {
  display: block; /* 블록 요소로 설정 */
  margin-bottom: 10px; /* 아래쪽 마진 설정 */
  color: #6c757d; /* 글자색 설정 */
}

/* 회원가입 링크 스타일 */
.signup-link {
  margin-top: 20px; /* 위쪽 마진 설정 */
  color: #6c757d; /* 글자색 설정 */
}

.signup-link a {
  color: #007bff; /* 링크 색상 설정 */
  text-decoration: none; /* 밑줄 제거 */
}

.signup-link a:hover {
  text-decoration: underline; /* 마우스를 올렸을 때 밑줄 표시 */
}
</style>
