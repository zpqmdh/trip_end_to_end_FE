<script setup>
import { ref, onMounted, isReactive } from "vue";
import { localAxios } from "@/util/http-commons";
import { logout, decodedTokenFunc } from "@/util/auth";
import { useRouter } from "vue-router";

const loginedId = decodedTokenFunc();
const router = useRouter();
const local = localAxios();
const member = ref({
  memberId: "",
  id: loginedId,
  password: "",
  name: "",
  birthdate: "",
  image: "",
  emailId: "",
  emailDomain: "",
  token: null,
  isActive: "",
  joinDate: "",
  type: "",
  nickname: "",
  sex: "",
  area: "",
  phoneNumber: "",
  mbti: "",
});

const loadMemberDetails = async () => {
  try {
    const id = loginedId;
    console.log(id);
    const response = await local.get(`/members/detail/${id}`);
    const data = response.data;

    member.value = {
      nickname: data.nickname,
      mbti: data.mbti,
      name: data.name,
      birthdate: data.birthdate,
      image: data.image,
      emailId: data.emailId,
      emailDomain: data.emailDomain,
      area: data.area,
      sex: data.sex,
      phoneNumber: data.phoneNumber,
    };
  } catch (error) {
    console.error("회원 정보를 불러오는 데 실패하였습니다.", error);
  }
};

onMounted(loadMemberDetails);

const handleUpdate = async () => {
  // 회원 정보 수정
  try {
    const id = loginedId;
    const response = await local.put(`/members/update/${id}`, member.value);
    alert(response.data);
  } catch (error) {
    console.error("회원 정보 수정에 실패하였습니다.");
  }
};

const handlePasswordChange = async () => {
  // 비밀번호 변경
  router.push({ name: "member-changepassword" });
};

const handleDelete = async () => {
  // 회원 탈퇴
  try {
    const id = loginedId;
    const response = await local.put(`/members/delete`, id);
    alert(response.data);
    logout();
    router.push({ name: "main" });
  } catch (error) {
    alert("탈퇴에 실패하였습니다.");
    console.error("탈퇴에 실패하였습니다.");
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
      <div class="profile-header">
        <img :src="member.image" alt="Profile Image" class="profile-image" />
        <div class="profile-details">
          <input v-model="member.nickname" type="text" placeholder="닉네임" />
          <input v-model="member.mbti" type="text" placeholder="MBTI" />
        </div>
      </div>
      <form class="member-details-form">
        <div class="form-group">
          <label for="name">이름</label>
          <input
            v-model="member.name"
            type="text"
            id="name"
            placeholder="이름"
          />
        </div>
        <div class="form-group">
          <label for="birthdate">생년월일</label>
          <input
            v-model="member.birthdate"
            type="date"
            id="birthdate"
            placeholder="생년월일"
          />
        </div>
        <div class="form-group">
          <label for="email">이메일</label>
          <input
            v-model="member.emailId"
            type="text"
            id="email"
            placeholder="이메일"
          />
        </div>
        <div class="form-group">
          <label for="area">지역</label>
          <input
            v-model="member.area"
            type="text"
            id="area"
            placeholder="지역"
          />
        </div>
        <div class="form-group">
          <label for="sex">성별</label>
          <input v-model="member.sex" type="text" id="sex" placeholder="성별" />
        </div>
        <div class="form-group">
          <label for="phoneNumber">휴대폰</label>
          <input
            v-model="member.phoneNumber"
            type="text"
            id="phoneNumber"
            placeholder="휴대폰"
          />
        </div>
        <div class="button-group">
          <button type="button" @click="handleUpdate">회원 정보 수정</button>
          <button type="button" @click="handlePasswordChange">
            비밀번호 변경
          </button>
          <button type="button" @click="handleDelete">회원탈퇴</button>
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
  grid-template-columns: repeat(2, 1fr);
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
