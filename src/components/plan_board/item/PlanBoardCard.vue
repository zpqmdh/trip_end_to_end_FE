<script setup>
import { onMounted } from "vue";
defineProps({ planArticle: Object });
onMounted(() => {
  console.log(planArticle);
});
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
          :to="{
            name: 'share-plan-detail',
            params: { id: planArticle.planBoardId },
          }"
          class="text-black text-decoration-none"
          >자세히 보기</router-link
        >
      </button>
    </div>
  </div>
</template>
<style scoped></style>
