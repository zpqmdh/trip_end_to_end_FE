<script setup>
import { RouterLink } from "vue-router";
import { RouterView } from "vue-router";
</script>

<template>
  <header>
    <nav>
      <ul>
        <li><router-link :to="{ name: 'plan-list' }">여행계획</router-link></li>
        <li>
          <router-link :to="{ name: 'share-plan-list' }">여행공유</router-link>
        </li>
        <li><router-link :to="{ name: 'notice' }">공지사항</router-link></li>
        <li><router-link :to="{ name: 'qna' }">고객센터</router-link></li>
        <li>
          <router-link :to="{ name: 'member-login' }">로그인</router-link>
        </li>
        <li>
          <router-link :to="{ name: 'member-signup' }">회원가입</router-link>
        </li>
        <li>
          <router-link :to="{ name: 'member-mypage' }">마이페이지</router-link>
        </li>
        <li>
          <router-link :to="{ name: 'member-login' }">로그아웃</router-link>
        </li>
      </ul>
    </nav>
  </header>
  <RouterView />
</template>

<style scoped></style>
