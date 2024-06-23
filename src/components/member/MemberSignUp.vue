<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons";
import Swal from "sweetalert2";

// Axios 인스턴스 생성
const local = localAxios();

// Vue Router 설정
const router = useRouter();

const file = ref(null);
const fileNames = ref([]);
const isDragActive = ref(false);
const checkNoInput = ref("");

// 회원가입 폼의 초기값 설정
const signupMember = ref({
  id: "",
  password: "",
  name: null,
  birthdate: null,
  emailId: null,
  emailDomain: null,
  image:
    "https://png.pngtree.com/png-vector/20191115/ourmid/pngtree-beautiful-profile-line-vector-icon-png-image_1990469.jpg",
  nickname: null,
  sex: null,
  area: null,
  phoneNumber: null,
  mbti: null,
});

// 회원가입 처리
const handleSignup = async () => {
  try {
    const formData = new FormData();
    formData.append(
      "signupMember",
      new Blob([JSON.stringify(signupMember.value)], {
        type: "application/json",
      })
    );
    formData.append("image", file.value);
    const response = await local.post("/members/signup", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log(response);
    Swal.fire({
      icon: "success",
      title: "회원가입 성공 !",
      text: `${response.data}`,
    });
    router.push({ name: "member-login" });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "회원가입 실패 !",
      text: "중복된 아이디가 이미 존재합니다.",
    });
  }
};

// 파일 변경 핸들러
function handleFileChange(event) {
  file.value = event.target.files[0];
  fileNames.value = [file.value.name];
  checkNoInput.value = "";
}

// 파일 입력 트리거
function triggerFileInput() {
  const fileInput = document.querySelector('input[type="file"]');
  fileInput.click();
}

function handleDragEnter() {
  isDragActive.value = true;
}

function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
}

function handleDragLeave() {
  isDragActive.value = false;
}

function handleDrop(event) {
  event.preventDefault();
  isDragActive.value = false;
  if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
    file.value = event.dataTransfer.files[0];
    fileNames.value = [file.value.name];
    console.log(file);
    checkNoInput.value = "";
  }
}
</script>

<template>
  <div class="signup-page">
    <!-- 회원가입 폼 -->
    <form @submit.prevent="handleSignup" class="signup-form">
      <h2 class="signup-title">회원가입</h2>
      <!-- 프로필 헤더 -->
      <div class="profile-header">
        <!-- 프로필 이미지 -->
        <img
          :src="signupMember.image"
          alt="Profile Image"
          class="profile-image"
          style="height: 130px; width: auto; margin-right: 30px"
        />
        <!-- 드래그 앤 드롭 영역 -->
        <div
          class="dnd-dropzone p-4 text-center mb-2"
          @dragenter.prevent="handleDragEnter"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
          :class="{ 'drag-over': isDragActive }"
        >
          <input
            type="file"
            @change="handleFileChange"
            class="d-none"
            ref="fileInput"
          />
          <div v-if="fileNames.length == 0">
            <p class="mb-0">프로필 사진을 등록하세요</p>
          </div>
          <div
            v-if="fileNames.length > 0"
            class="d-flex justify-content-center"
          >
            <p class="mb-0"><strong>파일명:</strong></p>
            <ul class="list-inline mb-0">
              <p v-for="(name, index) in fileNames" :key="index" class="mb-0">
                {{ name }}
              </p>
            </ul>
          </div>
          <p>
            Drag & Drop or
            <a href="#" @click.prevent="triggerFileInput">upload</a>
          </p>
        </div>
      </div>
      <!-- 회원가입 정보 입력 필드 -->
      <div class="form-group">
        <label for="id">아이디</label>
        <input
          v-model="signupMember.id"
          type="text"
          id="id"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">비밀번호</label>
        <input
          v-model="signupMember.password"
          type="password"
          id="password"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="name">이름</label>
        <input
          v-model="signupMember.name"
          type="text"
          id="name"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="nickname">닉네임</label>
        <input
          v-model="signupMember.nickname"
          type="text"
          id="nickname"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="birthdate">생년월일</label>
        <input
          v-model="signupMember.birthdate"
          type="date"
          id="birthdate"
          class="form-control"
        />
      </div>
      <div style="display: flex">
        <div class="form-group">
          <label for="emailId">이메일 ID</label>
          <input
            v-model="signupMember.emailId"
            type="text"
            id="emailId"
            class="form-control"
          />
        </div>
        <p style="margin: 7% 10px">@</p>
        <div class="form-group">
          <label for="emailDomain">이메일 도메인</label>
          <input
            v-model="signupMember.emailDomain"
            type="text"
            id="emailDomain"
            class="form-control"
          />
        </div>
      </div>
      <!-- 회원가입 버튼 -->
      <button type="submit" class="btn btn-primary">회원가입</button>
    </form>
  </div>
</template>

<style scoped>
/* signup-page 클래스: 페이지를 중앙 정렬하고 배경색을 설정 */
.signup-page {
  display: flex; /* Flexbox 사용으로 요소 정렬 */
  justify-content: center; /* 가로 중앙 정렬 */
  align-items: center; /* 세로 중앙 정렬 */
  height: 100vh; /* 화면 높이를 100%로 설정 */
  background-color: #b5ccce; /* 배경색 설정 */
}

/* signup-form 클래스: 폼 스타일 설정 */
.signup-form {
  background: #fff; /* 배경색을 흰색으로 설정 */
  padding: 20px; /* 내부 여백 설정 */
  border-radius: 8px; /* 테두리를 둥글게 설정 */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* 박스 그림자 설정 */
  width: 500px; /* 고정된 너비 설정 */
  text-align: center; /* 텍스트 중앙 정렬 */
}

/* signup-title 클래스: 제목 스타일 설정 */
.signup-title {
  margin-bottom: 20px; /* 아래쪽 여백 설정 */
  font-size: 24px; /* 글꼴 크기 설정 */
  font-weight: bold; /* 글꼴 두께 설정 */
}

/* form-group 클래스: 폼 그룹 스타일 설정 */
.form-group {
  margin-bottom: 15px; /* 아래쪽 여백 설정 */
}

/* form-control 클래스: 폼 컨트롤 스타일 설정 */
.form-control {
  width: 100%; /* 너비를 100%로 설정 */
  padding: 10px; /* 내부 여백 설정 */
  border: 1px solid #ccc; /* 테두리 설정 */
  border-radius: 4px; /* 테두리를 둥글게 설정 */
}

/* btn 클래스: 버튼 스타일 설정 */
.btn {
  width: 100%; /* 너비를 100%로 설정 */
  padding: 10px; /* 내부 여백 설정 */
  border: none; /* 테두리 제거 */
  border-radius: 4px; /* 테두리를 둥글게 설정 */
  font-size: 16px; /* 글꼴 크기 설정 */
  cursor: pointer; /* 마우스 커서 포인터로 변경 */
}

/* btn-primary 클래스: 기본 버튼 스타일 설정 */
.btn-primary {
  background-color: #000; /* 배경색을 검은색으로 설정 */
  color: #fff; /* 글자색을 흰색으로 설정 */
}

/* profile-header 클래스: 프로필 헤더 스타일 설정 */
.profile-header {
  display: flex; /* Flexbox 사용으로 요소 정렬 */
  align-items: center; /* 세로 중앙 정렬 */
  margin-bottom: 20px; /* 아래쪽 여백 설정 */
  justify-content: center; /* 가로 중앙 정렬 */
}

/* dnd-dropzone 클래스: 드래그 앤 드롭 영역 스타일 설정 */
.dnd-dropzone {
  border: 2px dashed #ccc; /* 점선 테두리 설정 */
  border-radius: 5px; /* 테두리를 둥글게 설정 */
  padding: 20px; /* 내부 여백 설정 */
  margin-right: 15px; /* 오른쪽 여백 설정 */
  height: 100px; /* 고정된 높이 설정 */
}

/* dnd-dropzone.drag-over 클래스: 드래그 오버 상태 스타일 설정 */
.dnd-dropzone.drag-over {
  background-color: #e0f7ff; /* 드래그 오버 시 배경색 변경 */
}
</style>
