<script setup>
import { ref } from "vue";
const searchOption = ref({
  sido: 0,
  gugun: 0,
  contentTypeId: 0,
  keyword: "",
});
</script>

<template>
  <form class="d-flex my-5 mx-5" role="search">
    <select
      id="search-area"
      class="form-select me-2"
      name="sidoCode"
      v-model="searchOption.sido"
      @change="getGugun(searchOption.sido)"
    >
      <option value="0" selected>검색 할 지역 선택</option>
    </select>
    <select
      id="search-gugun"
      class="form-select me-2"
      name="gugunCode"
      v-model="searchOption.gugun"
    >
      <option value="0" selected>구군 선택</option>
    </select>
    <select id="search-content-id" class="form-select me-2" v-model="searchOption.contentTypeId">
      <option value="0" selected>관광지 유형</option>
      <option value="12">관광지</option>
      <option value="14">문화시설</option>
      <option value="15">축제공연행사</option>
      <option value="25">여행코스</option>
      <option value="28">레포츠</option>
      <option value="32">숙박</option>
      <option value="38">쇼핑</option>
      <option value="39">음식점</option>
    </select>
    <input
      id="search-keyword"
      class="form-control me-2"
      type="search"
      placeholder="검색어"
      aria-label="검색어"
      v-model="searchOption.keyword"
    />
    <button id="btn-search" class="btn btn-outline-success" type="button" @click="search">
      검색
    </button>
  </form>
</template>
<style scoped></style>
