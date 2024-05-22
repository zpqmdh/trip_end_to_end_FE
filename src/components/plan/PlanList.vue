<script setup>
import PlanListOnGoing from "./item/PlanListOnGoing.vue";
import PlanListFinished from "./item/PlanListFinished.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const handleAddPlan = async () => {
  router.push({ name: "plan-write" });
};
</script>
<template>
  <button class="add-button btn" @click="handleAddPlan">여행 계획 추가</button>
  <div class="row contrainer">
    <PlanListOnGoing class="col-12" />
    <PlanListFinished class="col-12" />
  </div>
</template>
<style scoped>
.add-button {
  margin-top: 50px;
  margin-left: 356px;
  color: white;
  background-color: #577b8d;
}
.contrainer {
  margin-top: 30px;
  justify-content: center;
}
</style>
