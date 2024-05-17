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
      <button type="button">
        <router-link
          :to="{ name: 'share-plan-detail', params: { id: planArticle.planBoardId } }"
          class="text-black text-decoration-none"
          >자세히 보기</router-link
        >
      </button>
    </div>
  </div>
</template>
<style scoped></style>
