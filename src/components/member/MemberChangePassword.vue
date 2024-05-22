<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons";
import { decodedTokenFunc } from "@/util/auth";
import MemberMyPageSidebar from "./MemberMyPageSidebar.vue";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

const local = localAxios();
const router = useRouter();
const changePassword = ref({
  id: decodedTokenFunc(),
  currentPassword: "",
  newPassword: "",
  newPasswordCheck: "",
});

const handleChangePassword = async () => {
  if (changePassword.value.newPassword !== changePassword.value.newPasswordCheck) {
    Swal.fire({
      icon: "error",
      text: "새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.",
    });
    return;
  }
  try {
    const response = await local.put("/members/changepassword", changePassword.value);
    Swal.fire({
      icon: "success",
      text: "비밀번호 변경이 완료되었습니다.",
    });
    router.push({ name: "member-mypage" });
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
    <MemberMyPageSidebar />
    <div class="content">
      <form @submit.prevent="handleChangePassword">
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

.content {
  width: 80%;
  padding: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  width: 40%;
}

.form-group label {
  margin-bottom: 5px;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 20px;
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
  margin-top: 5px;
}

.button-group button:nth-child(1) {
  background-color: #577b8d;
  color: white;
}
</style>
