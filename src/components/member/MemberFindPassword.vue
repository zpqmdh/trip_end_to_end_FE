<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons";
import Swal from "sweetalert2";

// Axios 인스턴스 생성
const local = localAxios();

// Vue Router 설정
const router = useRouter();

// 비밀번호 찾기 폼의 데이터 초기값 설정
const findMember = ref({
  id: "",
  emailId: "",
  emailDomain: "",
});

// 비밀번호 찾기 완료 메세지
const findComplete = ref("");

// 비밀번호 찾기 처리 함수
const handleFindPassword = async () => {
  const response = await local.get(`/members/detail/${findMember.value.id}`);
  if (
    response.data.emailId == findMember.value.emailId &&
    response.data.emailDomain == findMember.value.emailDomain
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
};

// 로그인 페이지로 이동하는 함수
const handleMoveToLogin = async () => {
  router.push({ name: "member-login" });
};

// 회원가입 페이지로 이동하는 함수
const handleMoveToSignup = async () => {
  router.push({ name: "member-signup" });
};
</script>

<template>
  <div class="find-password-page">
    <!-- 비밀번호 찾기 폼 -->
    <form @submit.prevent="handleFindPassword" class="find-password-form">
      <!-- 비밀번호 찾기 완료 메세지가 없을  때 표시되는 부분 -->
      <div v-if="!findComplete">
        <h2 class="find-password-title">비밀번호 찾기</h2>
        <!-- 아이디 입력 필드 -->
        <div class="form-group">
          <label for="id" class="mb-2">아이디</label>
          <input
            v-model="findMember.id"
            type="text"
            class="form-control"
            required
          />
        </div>
        <!-- 이메일 입력 필드 -->
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
        <!-- 비밀번호 찾기 버튼 -->
        <button
          type="submit"
          class="btn btn-primary"
          @click="handleFindPassword"
        >
          비밀번호 찾기
        </button>
      </div>
      <!-- 비밀번호 찾기 완료 메세지가 있을 때 표시되는 부분 -->
      <div v-if="findComplete">
        {{ findComplete }}
      </div>
      <!-- 로그인 및 회원가입 페이지로 이동하는 버튼 -->
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
/* 비밀번호 찾기 페이지 스타일 */
.find-password-page {
  display: flex; /* 중앙 정렬을 위한 플렉스 박스 설정 */
  justify-content: center; /* 수평 중앙 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  height: 93.8vh; /* 전체 높이 설정 */
  background-color: #b5ccce; /* 배경색 설정 */
}

/* 비밀번호 찾기 폼 스타일 */
.find-password-form {
  background: #fff; /* 배경 흰색 설정 */
  padding: 20px; /* 폼 패딩 설정 */
  border-radius: 8px; /* 테두리 둥글게 설정 */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* 그림자 효과 설정 */
  width: 500px; /* 폼 너비 설정 */
  height: 500px; /* 폼 높이 설정 */
  text-align: center; /* 텍스트 중앙 정렬 */
  align-content: center; /* 내용물 중앙 정렬 */
}

/* 비밀번호 찾기 제목 스타일 */
.find-password-title {
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

/* 이메일 스타일 */
.email {
  margin-bottom: 30px; /* 아래쪽 마진 설정 */
  display: flex; /* 플렉스 박스로 설정 */
  height: 45px; /* 높이 설정 */
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
</style>
