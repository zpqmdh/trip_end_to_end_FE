<script setup>
const prop = defineProps({ planArticle: Object });
if (!prop.planArticle.planBoard.thumbnail.startsWith("http")) {
  prop.planArticle.planBoard.thumbnail =
    "http://localhost/products/" + prop.planArticle.planBoard.thumbnail;
}
console.log(prop.planArticle);
</script>
<template>
  <div class="card">
    <img class="card-img-top" :src="prop.planArticle.planBoard.thumbnail" alt="Card image cap" />
    <div class="card-body">
      <h5 class="card-title">{{ prop.planArticle.planBoard.subject }}</h5>
      <div class="card-info d-flex justify-content-end">
        {{ prop.planArticle.planBoard.registerTime }}
      </div>
      <hr />
      <div class="card-info">
        🗓️ {{ prop.planArticle.planBoard.startDate }} -
        {{ prop.planArticle.planBoard.endDate }}
      </div>
      <div class="d-flex justify-content-end">
        <router-link
          :to="{
            name: 'share-plan-detail',
            params: { id: prop.planArticle.planBoard.planBoardId },
          }"
          class="btn btn-primary"
        >
          자세히 보기
        </router-link>
      </div>
      <hr />
      <div class="d-flex justify-content-center">
        <button v-for="tag in prop.planArticle.tagList" :key="tag.planBoardTagId" class="tag-btn">
          #{{ tag.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 18rem;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.card-img-top {
  width: 100%;
  height: 200px;
  object-fit: contain;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.card-body {
  padding: 20px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.card-info {
  margin-bottom: 10px;
  text-align: center;
}

.tag-btn {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  color: #fff;
  background-color: #979fa7;
  border-radius: 0.25rem;
  margin-right: 5px;
  margin-bottom: 5px;
  margin-top: 3px;
  text-decoration: none;
  border: none;
}

.btn-primary {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  background-color: #5698ad;
  color: #fff;
  text-decoration: none;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.btn-primary:hover {
  background-color: #fff;
  border-color: #5698ad;
  color: #5698ad;
}
</style>
