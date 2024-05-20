<template>
  <div class="sidebar">
    <h5 class="category-title">마이페이지</h5>
    <ul class="list-group mb-3">
      <li
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <router-link :to="{ name: 'member-mypage' }" class="sidebar-text"
          >내 정보 관리</router-link
        >
      </li>
      <li
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <router-link :to="{ name: 'plan-list' }" class="sidebar-text"
          >나의 여행 계획</router-link
        >
      </li>
      <li
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <router-link :to="{ name: 'member-myboard' }" class="sidebar-text"
          >내가 쓴 글</router-link
        >
      </li>
    </ul>
  </div>
</template>

<script setup></script>

<style scoped>
.sidebar {
  width: 300px;
  padding: 20px;
  background-color: #fff;
  /* border: 1px solid #dee2e6; */
  border-radius: 0.25rem;
}
.category-title {
  font-weight: bold;
  margin-left: 10px;
  margin-bottom: 10px;
}
.sidebar .list-group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sidebar .badge {
  background-color: #e9ecef;
  color: #495057;
}
.sidebar-text {
  color: black;
  text-decoration: none;
  transition: color 0.3s;
}
</style>
