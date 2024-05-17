<script setup>
defineProps({ article: Object });
</script>
<template>
  <tr class="text-center">
    <td>{{ article.articleNo }}</td>
    <td>
      <router-link
        :to="{
          name: 'qna-detail',
          params: { id: article.articleNo },
        }"
        >{{ article.subject }}</router-link
      >
    </td>
    <td>{{ article.userId }}</td>
    <td>{{ article.hit }}</td>
    <td>{{ article.registerTime }}</td>
  </tr>
</template>
