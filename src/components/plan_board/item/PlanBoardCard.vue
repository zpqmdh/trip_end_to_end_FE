<script setup>
import { usePlanBoardStore } from "@/stores/plan-board.js";
const planBoardStore = usePlanBoardStore();

const { setArticle } = planBoardStore;

defineProps({ planArticle: Object });
</script>
<template>
  <div class="card" style="width: 18rem">
    <img
      class="card-img-top"
      :src="planArticle.thumbnail"
      alt="Card
    image cap"
    />
    <div class="card-body">
      <h5 class="card-title">{{ planArticle.subject }}</h5>
      <p class="card-text">{{ planArticle.content }}</p>
      <button type="button" @click="setArticle(planArticle.planBoardId)">자세히 보기</button>
    </div>
  </div>
</template>
<style scoped></style>
