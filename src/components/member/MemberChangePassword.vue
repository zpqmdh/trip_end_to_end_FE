<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons";
import { decodedTokenFunc } from "@/util/auth";
import MemberMyPageSidebar from "./MemberMyPageSidebar.vue";
import Swal from "sweetalert2";

// Axios 인스턴스 생성
const local = localAxios();

// Vue Router 설정
const router = useRouter();

// 비밀번호 변경 폼의 데이터 초기값 설정
const changePassword = ref({
  id: decodedTokenFunc(), // JWT 토큰에서 사용자 ID 디코딩
  currentPassword: "",
  newPassword: "",
  newPasswordCheck: "",
});

// 비밀번호 변경 처리 함수
const handleChangePassword = async () => {
  // 새 비밀번호와 새 비밀번호 확인이 일치하는지 확인
  if (
    changePassword.value.newPassword !== changePassword.value.newPasswordCheck
  ) {
    Swal.fire({
      icon: "error",
      text: "새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.",
    });
    return;
  }

  // 비밀번호 변경 요청 전송
  try {
    const response = await local.put(
      "/members/changepassword",
      changePassword.value
    );
    Swal.fire({
      icon: "success",
      text: "비밀번호 변경이 완료되었습니다.",
    });
    router.push({ name: "member-mypage" }); // 비밀번호 변경 후 마이페이지로 이동
  } catch (error) {
    Swal.fire({
      icon: "error",
      text: "비밀번호 변경에 실패하였습니다.",
    });
    console.error("비밀번호 변경에 실패하였습니다.", error);
  }
};
</script>

<template>
  <div class="mypage-container">
    <!-- 마이페이지 사이드바 컴포넌트 -->
    <MemberMyPageSidebar />
    <div class="content">
      <form @submit.prevent="handleChangePassword">
        <!-- 현재 비밀번호 입력 필드 -->
        <div class="form-group">
          <label for="currentPassword">현재 비밀번호</label>
          <input
            v-model="changePassword.currentPassword"
            type="password"
            id="currentPassword"
            placeholder="현재 비밀번호를 입력하세요."
          />
        </div>
        <!-- 새 비밀번호 입력 필드 -->
        <div class="form-group">
          <label for="newPassword">새 비밀번호</label>
          <input
            v-model="changePassword.newPassword"
            type="password"
            id="newPassword"
            placeholder="새 비밀번호를 입력하세요."
          />
        </div>
        <!-- 새 비밀번호 확인 입력 필드 -->
        <div class="form-group">
          <label for="newPasswordCheck">새 비밀번호 확인</label>
          <input
            v-model="changePassword.newPasswordCheck"
            type="password"
            id="newPasswordCheck"
            placeholder="새 비밀번호를 다시 입력하세요."
          />
        </div>
        <!-- 비밀번호 변경 버튼 -->
        <div class="button-group">
          <button type="submit">비밀번호 변경</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* 마이페이지 컨테이너 */
.mypage-container {
  display: flex; /* 컨테이너를 플렉스 박스로 설정 */
}

/* 컨텐츠 영역 */
.content {
  width: 80%; /* 컨텐츠 영역의 너비 설정 */
  padding: 20px; /* 컨텐츠 패딩 설정 */
}

/* 입력창 및 레이블 */
.form-group {
  display: flex; /* 폼 그룹을 플렉스 박스로 설정 */
  flex-direction: column; /* 세로 방향으로 정렬 */
  width: 40%; /* 폼 그룹의 너비 설정 */
}

/* 레이블 스타일 */
.form-group label {
  margin-bottom: 5px; /* 레이블 아래 마진 설정 */
}

/* 입력 필드 스타일 */
.form-group input {
  padding: 10px; /* 입력 필드 패딩 설정 */
  border: 1px solid #ccc; /* 입력 필드 테두리 설정 */
  border-radius: 4px; /* 입력 필드 테두리 둥글게 설정 */
  margin-bottom: 20px; /* 입력 필드 아래 마진 설정 */
}

/* 버튼 그룹 */
.button-group {
  display: flex; /* 버튼 그룹을 플렉스 박스로 설정 */
  justify-content: space-between; /* 버튼 간의 공간을 균등하게 분배 */
}

/* 버튼 스타일 */
.button-group button {
  padding: 10px 20px; /* 버튼 패딩 설정 */
  border: none; /* 버튼 테두리 제거 */
  border-radius: 4px; /* 버튼 테두리 둥글게 설정 */
  cursor: pointer; /* 커서 포인터로 변경 */
  margin-top: 5px; /* 버튼 위쪽 마진 설정 */
}

/* 첫 번째 버튼 스타일 (nth-child(1)) */
.button-group button:nth-child(1) {
  background-color: #577b8d; /* 배경색 설정 */
  color: white; /* 글자색 흰색으로 설정 */
}
</style>
