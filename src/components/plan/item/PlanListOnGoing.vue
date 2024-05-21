<script setup>
import { ref, onMounted } from "vue";
import { localAxios } from "@/util/http-commons.js";
import { useRouter } from "vue-router";
import { decodedTokenFunc } from "@/util/auth.js";

const local = localAxios();
const router = useRouter();
const loginedId = decodedTokenFunc();
const onGoingPlanList = ref();

var today = new Date();

var year = today.getFullYear();
var month = ("0" + (today.getMonth() + 1)).slice(-2);
var day = ("0" + today.getDate()).slice(-2);

var dateString = year + "-" + month + "-" + day;
const todayDate = new Date(dateString);
const getOnGoingPlanList = async () => {
  const id = loginedId;
  local.get(`/plans/list/${id}`).then(({ data }) => {
    onGoingPlanList.value = data.filter(
      (plan) => new Date(plan.endDate) > todayDate
    );
  });
};

const handleGoToDetail = (planId) => {
  console.log(planId);
  router.push({ name: "plan-detail", params: { id: planId } });
};

onMounted(() => {
  getOnGoingPlanList();
});
</script>
<template>
  <div class="container">
    <h2 class="title">진행중인 여행 계획</h2>
    <div class="plan-list">
      <div v-for="plan in onGoingPlanList" :key="plan.planId" class="plan-item">
        <button class="plan-title" @click="handleGoToDetail(plan.planId)">
          {{ plan.title }}
        </button>
        <div class="plan-dates">{{ plan.startDate }} ~ {{ plan.endDate }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 40%;
  margin: 0 auto;
  margin-left: 150px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.no-plan {
  font-size: 16px;
  color: #888;
  text-align: center;
}

.plan-list {
  width: 100%;
}

.plan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  background-color: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.plan-item:hover {
  transform: translateY(-5px);
}

.plan-title {
  font-size: 18px;
  font-weight: 500;
  background: none;
  border: none;
  color: black;
  cursor: pointer;
  text-align: left;
  margin-left: 2%;
}

.plan-title:hover {
  text-decoration: underline;
}

.plan-dates {
  font-size: 14px;
  color: #666;
}
</style>
