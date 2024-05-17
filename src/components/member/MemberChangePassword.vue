<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons";
import { decodedTokenFunc } from "@/util/auth";

const local = localAxios();
const router = useRouter();
const changePassword = ref({
  id: decodedTokenFunc(),
  currentPassword: "",
  newPassword: "",
  newPasswordCheck: "",
});

const handleChangePassword = async () => {
  if (
    changePassword.value.newPassword !== changePassword.value.newPasswordCheck
  ) {
    alert("새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.");
    return;
  }
  try {
    const response = await local.put(
      "/members/changepassword",
      changePassword.value
    );
    alert("비밀번호 변경이 완료되었습니다.");
    router.push({ name: "member-mypage" });
  } catch (error) {
    if (error.response && error.response.status === 403) {
      alert("탈퇴된 아이디입니다.");
    } else {
      alert("로그인에 실패하였습니다.");
    }
    console.error("로그인에 실패하였습니다.", error);
  }
};
</script>

<template>
  <div class="mypage-container">
    <div class="sidebar">
      <ul>
        <li><router-link to="#">내 정보 관리</router-link></li>
        <li><router-link to="#">나의 여행 계획</router-link></li>
        <li><router-link to="#">내가 쓴 글</router-link></li>
      </ul>
    </div>
    <div class="content">
      <form class="member-details-form" @submit.prevent="handleChangePassword">
        <div class="form-group">
          <label for="currentPassword">현재 비밀번호</label>
          <input
            v-model="changePassword.currentPassword"
            type="password"
            id="currentPassword"
            placeholder="현재 비밀번호를 입력하세요."
          />
        </div>
        <div class="form-group">
          <label for="newPassword">새 비밀번호</label>
          <input
            v-model="changePassword.newPassword"
            type="password"
            id="newPassword"
            placeholder="새 비밀번호를 입력하세요."
          />
        </div>
        <div class="form-group">
          <label for="newPasswordCheck">새 비밀번호 확인</label>
          <input
            v-model="changePassword.newPasswordCheck"
            type="password"
            id="newPasswordCheck"
            placeholder="새 비밀번호를 다시 입력하세요."
          />
        </div>
        <div class="button-group">
          <button type="submit">비밀번호 변경</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.mypage-container {
  display: flex;
}

.sidebar {
  width: 20%;
  padding: 20px;
  border-right: 1px solid #ccc;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar ul li {
  margin-bottom: 10px;
}

.content {
  width: 80%;
  padding: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-right: 20px;
}

.profile-details input {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
}

.member-details-form {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.button-group {
  grid-column: span 2;
  display: flex;
  justify-content: space-between;
}

.button-group button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button-group button:nth-child(1) {
  background-color: #007bff;
  color: white;
}

.button-group button:nth-child(2) {
  background-color: #ffc107;
  color: white;
}

.button-group button:nth-child(3) {
  background-color: #dc3545;
  color: white;
}
</style>
