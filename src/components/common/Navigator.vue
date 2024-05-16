<script setup>
import { RouterLink } from "vue-router";
import { ref } from "vue";

const navbarOpen = ref(false);

const toggleNavbar = () => {
  navbarOpen.value = !navbarOpen.value;
};
</script>

<template>
  <header>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <button
        @click="toggleNavbar"
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div :class="{ collapse: !navbarOpen, 'navbar-collapse': true }" id="navbarNav">
        <ul class="navbar-nav justify-between">
          <li class="nav-item active">
            <router-link :to="{ name: 'main' }">메인</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'plan-list' }">여행계획</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'share-plan-list' }">여행공유</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'notice' }">공지사항</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'qna' }">고객센터</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'member-login' }">로그인</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'member-signup' }">회원가입</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'member-mypage' }">마이페이지</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'member-login' }">로그아웃</router-link>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<style scoped></style>
