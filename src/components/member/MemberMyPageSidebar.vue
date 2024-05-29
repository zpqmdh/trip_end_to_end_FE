<template>
  <div class="sidebar">
    <!-- 카테고리 제목 -->
    <h5 class="category-title">마이페이지</h5>
    <!-- 리스트 그룹 -->
    <ul class="list-group mb-3">
      <!-- 내 정보 관리 링크 -->
      <li
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <router-link :to="{ name: 'member-mypage' }" class="sidebar-text"
          >내 정보 관리</router-link
        >
      </li>
      <!-- 나의 여행 계획 링크 -->
      <li
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <router-link :to="{ name: 'plan-list' }" class="sidebar-text"
          >나의 여행 계획</router-link
        >
      </li>
      <!-- 내가 쓴 글 링크 -->
      <!-- <li
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <router-link :to="{ name: 'member-myboard' }" class="sidebar-text"
          >내가 쓴 글</router-link
        >
      </li> -->
    </ul>
  </div>
</template>

<script setup></script>

<style scoped>
/* 사이드바 컨테이너 */
.sidebar {
  width: 300px; /* 너비 설정 */
  padding: 20px; /* 패딩 설정 */
  background-color: #fff; /* 배경색 흰색 */
  border-radius: 0.25rem; /* 테두리 둥글게 설정 */
}

/* 카테고리 제목 */
.category-title {
  font-weight: bold; /* 폰트 굵게 설정 */
  margin-left: 10px; /* 왼쪽 마진 설정 */
  margin-bottom: 10px; /* 아래쪽 마진 설정 */
}

/* 리스트 그룹 아이템 */
.sidebar .list-group-item {
  display: flex; /* 플렉스 박스 레이아웃 설정 */
  justify-content: space-between; /* 공간을 균등하게 분배 */
  align-items: center; /* 수직 정렬 */
}

/* 배지 스타일 */
.sidebar .badge {
  background-color: #e9ecef; /* 배경색 설정 */
  color: #495057; /* 글자색 설정 */
}

/* 사이드바 텍스트 링크 */
.sidebar-text {
  color: black; /* 글자색 검정 */
  text-decoration: none; /* 밑줄 제거 */
  transition: color 0.3s; /* 색상 전환 효과 */
}
</style>
