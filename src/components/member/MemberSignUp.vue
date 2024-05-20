<script setup>
import { ref } from "vue";
import { localAxios } from "@/util/http-commons";
import { useRouter } from "vue-router";

const local = localAxios();
const router = useRouter();
const file = ref(null);
const fileNames = ref([]);
const isDragActive = ref(false);
const checkNoInput = ref("");
const signupMember = ref({
  id: "",
  password: "",
  name: null,
  birthdate: null,
  emailId: null,
  emailDomain: null,
  image: null,
  nickname: null,
  sex: null,
  area: null,
  phoneNumber: null,
  mbti: null,
});

const handleSignup = async () => {
  try {
    const response = await local.post("/members/signup", signupMember.value);
    alert(response.data);
    router.push({ name: "main" });
  } catch (error) {
    alert("회원가입에 실패하였습니다.");
  }
};

function handleFileChange(event) {
  file.value = event.target.files[0];
  fileNames.value = [file.value.name];
  checkNoInput.value = "";
  landmarks.value = null;
}

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
    <form @submit.prevent="handleSignup" class="signup-form">
      <h2 class="signup-title">회원가입</h2>
      <div class="profile-header">
        <img
          src=""
          alt="Profile Image"
          class="profile-image"
          style="margin-right: 30px"
        />
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

      <button type="submit" class="btn btn-primary">회원가입</button>
    </form>
  </div>
</template>

<style scoped>
.signup-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #b5ccce;
}

.signup-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 500px;
  text-align: center;
}

.signup-title {
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

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  justify-content: center;
}

.dnd-dropzone {
  border: 2px dashed #ccc;
  border-radius: 5px;
  padding: 20px;
  margin-right: 15px;
  height: 100px;
}
.dnd-dropzone.drag-over {
  background-color: #e0f7ff;
}
</style>
