<script setup>
import { RouterLink } from "vue-router";
import { ref } from "vue";
function toggleNavbar() {
  const navbar = document.getElementById("navbarNav");
  navbar.classList.toggle("show");
}
</script>

<template>
  <header>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">Trip End-to-End</a>
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
        @click.prevent="toggleNavbar"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ml-auto mt-2 mt-lg-0">
          <li class="nav-item">
            <router-link :to="{ name: 'plan-list' }" class="nav-link">여행계획</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'share-plan-list' }" class="nav-link">여행공유</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'notice-list' }" class="nav-link">공지사항</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'qna-list' }" class="nav-link">고객센터</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'member-login' }" class="nav-link">로그인</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'member-signup' }" class="nav-link">회원가입</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'member-mypage' }" class="nav-link">마이페이지</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'member-login' }" class="nav-link">로그아웃</router-link>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.navbar-nav {
  margin-left: auto; /* ul 태그 오른쪽 이동 */
}

.navbar-nav .nav-item {
  margin-left: 15px; /* 간격 조정 */
}

.navbar-nav .nav-link {
  color: black; /* 글자색 검은색으로 설정 */
  text-decoration: none; /* 밑줄 제거 */
  transition: color 0.3s; /* transition 효과 추가 */
}

.navbar-nav .nav-link:hover {
  color: #9ec0c1; /* hover 시 글자색 변경 */
}
</style>
