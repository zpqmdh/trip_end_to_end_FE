<template>
  <div class="main-view">
    <div class="hero text-center">
      <h1>여행 계획의 모든 것을 담은</h1>
      <div style="display: flex; justify-content: center">
        <h1 style="color: #357081; margin-right: 10px">Trip End-to-End</h1>
        <h1>와 함께하세요</h1>
      </div>

      <div class="btn-group mt-4">
        <button class="btn btn-light">
          <router-link :to="{ name: 'landmark' }" class="text-black" style="text-decoration: none"
            >사진으로 장소찾기</router-link
          >
        </button>
        <button class="btn btn-primary">
          <router-link :to="{ name: 'plan-write' }" class="text-black" style="text-decoration: none"
            >여행계획 바로가기</router-link
          >
        </button>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
html,
body {
  height: 100vh;
  margin: 0;
  overflow: hidden;
}

.main-view {
  background: url("@/assets/img/background.jpeg") no-repeat center center fixed;
  background-size: cover;
  height: 93.8vh;
  color: #fff;
  overflow: hidden;
}

.hero {
  position: absolute;
  top: 50%;
  left: 65%;
  width: 60%;
  transform: translate(-50%, -50%);
  color: #000;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: bold;
}

.btn-group .btn {
  font-size: 1.25rem;
  padding: 0.75rem 1.5rem;
  margin: 0 0.5rem;
  border-radius: 25px;
}

.btn-light {
  background-color: #fff;
  color: #000;
  border: none;
}

.btn-primary {
  background-color: #4c8799;
  border: none;
}

.btn-primary:hover {
  background-color: #4c8799;
}
</style>
