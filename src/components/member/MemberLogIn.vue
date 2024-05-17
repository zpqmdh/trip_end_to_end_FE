<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { localAxios } from '@/util/http-commons';
import { login } from '@/util/auth';

const router = useRouter();
const loginMember = ref({
  id: '',
  password: ''
});

const handleLogin = async () => {
  try {
    const response = await localAxios().post('/members/login', loginMember.value);
    const { accessToken, refreshToken } = response.data;

    // 토큰 저장 (localStorage)
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // 로그인 상태 변경
    login();
    
    // 메인 화면으로 라우팅
    router.push({name: "main"});
  } catch (error) {
    alert('로그인에 실패하였습니다.');
  }
};
</script>
<template>
  <div>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="id">ID</label>
        <input v-model="loginMember.id" type="text" id="id" required />
      </div>
      <div>
        <label for="password">Password</label>
        <input v-model="loginMember.password" type="password" id="password" required />
      </div>
      <button type="submit">Login</button>
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
