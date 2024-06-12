<script setup>
import { computed } from "vue";

// QnABoardList.vue에서 props로 currentPage, totalPage 받기
const props = defineProps({ currentPage: Number, totalPage: Number });
// 유저가 다른 페이지로 이동하려고 하면 부모에게 emit으로 전달
const emit = defineEmits(["pageChange"]);

// 네비게이션 수 : 자유롭게 설정
const navigationSize = parseInt(import.meta.env.VITE_ARTICLE_NAVIGATION_SIZE);

const startPage = computed(() => {
  return (
    parseInt((props.currentPage - 1) / navigationSize) * navigationSize + 1
  );
});

const endPage = computed(() => {
  let lastPage =
    parseInt((props.currentPage - 1) / navigationSize) * navigationSize +
    navigationSize;
  return props.totalPage < lastPage ? props.totalPage : lastPage;
});

const endRange = computed(() => {
  return (
    parseInt((props.totalPage - 1) / navigationSize) * navigationSize <
    props.currentPage
  );
});

function range(start, end) {
  const list = [];
  for (let i = start; i <= end; i++) list.push(i);
  return list;
}

function onPageChange(pg) {
  emit("pageChange", pg);
}
</script>

<template>
  <div class="row">
    <ul class="pagination justify-content-center">
      <li class="page-item">
        <a class="page-link" @click="onPageChange(1)">최신</a>
      </li>
      <li class="page-item">
        <a
          class="page-link"
          @click="onPageChange(startPage == 1 ? 1 : startPage - 1)"
          >이전</a
        >
      </li>
      <template v-for="pg in range(startPage, endPage)" :key="pg">
        <!-- 해당 페이지에 해당하면 active 속성 -->
        <li :class="currentPage === pg ? 'page-item active' : 'page-item'">
          <a class="page-link" @click="onPageChange(pg)">{{ pg }}</a>
        </li>
      </template>
      <li class="page-item">
        <a
          class="page-link"
          @click="onPageChange(endRange ? totalPage : endPage + 1)"
          >다음</a
        >
      </li>
      <li class="page-item">
        <a class="page-link" @click="onPageChange(totalPage)">마지막</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
a {
  cursor: pointer;
}
.page-link {
  color: #577b8d;
}
.page-item a {
  background-color: white;
  color: #577b8d;
}

.page-item {
  border-color: #577b8d;
}
.page-item.active a {
  background-color: #577b8d;
  color: white;
  border-color: #577b8d;
}
</style>
