<script setup>
import { ref } from "vue";
import { localAxios } from "@/util/http-commons";
import { useRouter } from "vue-router";

const local = localAxios();
const router = useRouter();

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
</script>
<template>
  <div>
    <form @submit.prevent="handleSignup">
      <div>
        <label for="Id">ID</label>
        <input v-model="signupMember.id" type="text" id="memberId" required />
      </div>
      <div>
        <label for="password">Password</label>
        <input
          v-model="signupMember.password"
          type="password"
          id="password"
          required
        />
      </div>
      <div>
        <label for="name">Name</label>
        <input v-model="signupMember.name" type="text" id="name" required />
      </div>
      <div>
        <label for="birthdate">Birthdate</label>
        <input v-model="signupMember.birthdate" type="date" id="birthdate" />
      </div>
      <div>
        <label for="emailId">Email ID</label>
        <input v-model="signupMember.emailId" type="text" id="emailId" />
      </div>
      <div>
        <label for="emailDomain">Email Domain</label>
        <input
          v-model="signupMember.emailDomain"
          type="text"
          id="emailDomain"
        />
      </div>
      <div>
        <label for="image">Image URL</label>
        <input v-model="signupMember.image" type="text" id="image" />
      </div>
      <div>
        <label for="nickname">닉네임</label>
        <input
          v-model="signupMember.nickname"
          type="text"
          id="nickname"
          required
        />
      </div>

      <button type="submit">Sign Up</button>
    </form>
  </div>
</template>
<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
