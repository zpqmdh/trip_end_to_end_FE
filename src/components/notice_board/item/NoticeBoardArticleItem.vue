<script setup>
defineProps({ article: Object });
</script>
<template>
  <tr class="text-center">
    <td>{{ article.noticeBoardId }}</td>
    <td>
      <router-link
        :to="{
          name: 'notice-detail',
          params: { id: article.noticeBoardId },
        }"
        >{{ article.subject }}</router-link
      >
    </td>
    <td>{{ article.hit }}</td>
    <td>{{ article.nickname }}</td>
    <td>{{ article.registerTime }}</td>
  </tr>
</template>
