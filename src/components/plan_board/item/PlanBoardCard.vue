<script setup>
defineProps({ planArticle: Object });
</script>
<template>
  <div class="card" style="width: 18rem">
    <img class="card-img-top" src="..." alt="Card image cap" />
    <div class="card-body">
      <h5 class="card-title">{{ planArticle.subject }}</h5>
      <p class="card-text">{{ planArticle.id }}</p>
      <a href="#" class="btn btn-primary">Go somewhere</a>
    </div>
  </div>
</template>
<style scoped></style>
